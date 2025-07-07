import { VoiceSearchOptions } from '@/types/search-box/SearchBoxOptions'
import { buildSocketMessageFrameHeader } from '@/utils/stream.utils'
import { ref, computed, onBeforeUnmount } from 'vue'

export function useVoiceRecorder(options: VoiceSearchOptions) {
  const socket = ref<WebSocket | null>(null)

  const mediaStream = ref<MediaStream | null>(null)
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const isRecording = ref(false)
  const isSocketReady = ref(false)
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

    socket.value.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data)

        if (msg.event === 'ready') {
          if (mediaRecorder.value?.state !== 'recording') {
            try {
              isSocketReady.value = true
              await startRecording()
            } catch (error) {
              console.error('Recording failed to start:', error)
              closeSocket()
            }
          }
        } else if (msg.event === 'transcription') {
          transcription.value = msg.transcription
          onMessage?.(msg.transcription)
          stopSocketConnection()
        } else if (msg.event === 'error') {
          errorRef.value = msg.message || 'An error occurred during transcription'
          isSocketReady.value = false
          stopRecording()
          closeSocket()
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error)
      }
    }

    socket.value.onclose = (event) => {
      if (event.code === 4001) {
        errorRef.value = event.reason || 'Connection closed by server'
      }
      stopRecording()
    }

    socket.value.onerror = () => {
      errorRef.value = 'Service connection error'
      stopRecording()
    }
  }

  const onMediaRecorderDataAvailable = async (event: BlobEvent) => {
    if (!isSocketReady.value || socket.value?.readyState !== WebSocket.OPEN) {
      console.warn('Skipping audio chunk: socket not ready.')
      return
    }

    const audioBuffer = await event.data.arrayBuffer()
    const header = buildSocketMessageFrameHeader('audio-chunk', audioBuffer.byteLength)
    const buffer = new Uint8Array(header.length + audioBuffer.byteLength)
    buffer.set(header, 0)
    buffer.set(new Uint8Array(audioBuffer), header.length)
    socket.value?.send(buffer)
  }
  
  const startRecording = async () => {
    try {
      mediaStream.value = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          channelCount: 1,
          echoCancellation: true,
          sampleRate: options.sampleRate || 16000,
        },
      })

      mediaRecorder.value = new MediaRecorder(mediaStream.value, {
        mimeType: 'audio/webm; codecs=opus',
      })
      
      mediaRecorder.value.ondataavailable = onMediaRecorderDataAvailable
      
      // Send time slice every second
      mediaRecorder.value.start(timeSliceLength.value)
      isRecording.value = true
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        errorRef.value = 
          options.labels?.microphoneNotAllowed || 'Microphone access denied. Please allow microphone access in your browser settings.'
      } else if (error.name === 'NotFoundError') {
        errorRef.value = 
          options.labels?.microphoneNotFound || 'No microphone found. Please connect a microphone and try again.'
      }
    }
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
    isSocketReady.value = false
  }

  const reset = () => {
    stopRecording()
    closeSocket()
    transcription.value = ''
    errorRef.value = null
    isRecording.value = false
    isSocketReady.value = false
  }

  return { 
    isRecording,
    isSocketReady,
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