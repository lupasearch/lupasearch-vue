import { VoiceSearchOptions } from '@/types/search-box/SearchBoxOptions'
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
      errorRef.value = 'WebSocket error'
    }
  }

  const onMediaRecorderDataAvailable = (event: BlobEvent) => {
    if (mediaRecorder.value?.state !== 'recording') {
      return
    }
  
    // Encode audio data to base64 for sending over WebSocket
    const reader = new FileReader()
    reader.readAsDataURL(event.data)
    reader.onloadend = () => {
      const base64DataChunks = reader.result as string
      const base64Data = base64DataChunks.split(',')[1]
  
      socket.value?.send(JSON.stringify({ 
        event: 'audio-chunk', 
        data: base64Data 
      }))
    }
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
      socket.value.send(JSON.stringify({ event: 'audio-chunk-end' }))
      setTimeout(() => {
        isRecording.value = false
      }, 2000)
    }
    startRecording()
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