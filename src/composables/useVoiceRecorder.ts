import { VoiceSearchOptions } from '@/types/search-box/SearchBoxOptions'
import { buildSocketMessageFrameHeader } from '@/utils/stream.utils'
import { ref, computed, onBeforeUnmount } from 'vue'

export function useVoiceRecorder(options: VoiceSearchOptions) {
  const socket = ref<WebSocket | null>(null)

  const mediaStream = ref<MediaStream | null>(null)
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const isRecording = ref(false)
  const errorRef = ref<string | null>(null)
  const transcription = ref('')
  const timeSliceLength = computed(() => options.timesliceLength ?? 1000)

  onBeforeUnmount(() => {
    closeSocket()
    stopRecording()
  })

  const initSocket = (
    url: string, 
    onMessage?: (transcription: string) => void
  ) => {
    socket.value = new WebSocket(url)

    socket.value.onopen = async () => {
      if (mediaRecorder.value?.state !== 'recording') {
        await startRecording()
      }
    }

    socket.value.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.event === 'transcription') {
        transcription.value = msg.transcription
        onMessage?.(msg.transcription)
        stopSocketConnection()
      } else if (msg.event === 'error') {
        errorRef.value = 'Server error during transcription'
        stopRecording()
      }
    }

    socket.value.onclose = () => {
      stopRecording()
    }

    socket.value.onerror = () => {
      stopRecording()
      errorRef.value = 'WebSocket error'
    }
  }

  const onMediaRecorderDataAvailable = async (event: BlobEvent) => {
    if (mediaRecorder.value?.state !== 'recording') return

    const audioBuffer = await event.data.arrayBuffer()
    const header = buildSocketMessageFrameHeader('audio-chunk', audioBuffer.byteLength)
    const buffer = new Uint8Array(header.length + audioBuffer.byteLength)
    buffer.set(header, 0)
    buffer.set(new Uint8Array(audioBuffer), header.length)
    socket.value?.send(buffer)
  }
  
  const startRecording = async () => {
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        channelCount: 1,
        echoCancellation: true,
        sampleRate: 16000,
      },
    })

    mediaRecorder.value = new MediaRecorder(mediaStream.value, {
      mimeType: 'audio/webm; codecs=opus',
    })
    
    mediaRecorder.value.ondataavailable = onMediaRecorderDataAvailable
    
    // Send time slice every second
    mediaRecorder.value.start(timeSliceLength.value)
    isRecording.value = true
  }
  
  
  const stopRecording = () => {
    mediaRecorder.value?.stop()
    mediaStream.value?.getTracks().forEach((track: MediaStreamTrack) => {
      track.stop()
    })
    isRecording.value = false
  }

  const stopSocketConnection = () => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      const endHeader = buildSocketMessageFrameHeader('audio-chunk-end', 0)
      socket.value.send(endHeader)
      setTimeout(() => {
        closeSocket()
      }, 1000)
    }
  }

  const closeSocket = () => {
    socket.value?.close()
    socket.value = null
  }

  const reset = () => {
    stopRecording()
    closeSocket()
    transcription.value = ''
    errorRef.value = null
    isRecording.value = false
  }

  return { 
    isRecording,
    transcription,
    errorRef,
    initSocket,
    startRecording,
    stopRecording,
    stopSocketConnection,
    reset,
    closeSocket,
   }
}