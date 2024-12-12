<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { VoiceSearchOptions } from '@/types/search-box/SearchBoxOptions';
import { getVoiceServiceApiUrl } from '@/utils/api.utils';

const socket = ref<WebSocket | null>(null)

const isRecordingRef = ref<boolean>(false)
const mediaStream = ref<MediaStream | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const timesliceLimit = ref<number>(4)
const transcription = ref('')
const chunkLength = 1000
const stopDelay = 500

const props = defineProps<{
  isOpen: boolean,
  options: VoiceSearchOptions
}>()

const emit = defineEmits([
  'close',
  'transcript-update',
  'stop-recognize'
])

watch(transcription, (newValue) => {
  emit('transcript-update', newValue)
})

const description = computed(() => {
  if (!isRecordingRef.value && !transcription.value) {
    return 'Microphone is off. Try again.'
  }

  if (isRecordingRef.value && !transcription.value) {
    return 'Listening...'
  }

  return transcription.value
})

const startRecognize = async () => {
  if (
    isRecordingRef.value ||
    (mediaRecorder.value && mediaRecorder.value.state === 'recording')
  ) {
    return
  }

  try {
    // TODO: how to better handle environment here
    socket.value = new WebSocket(
      `${getVoiceServiceApiUrl("production", props.options.customVoiceServiceUrl)}?lang=${props.options.language ?? "en-US"}&connectionType=write-first`
    )

    socket.value.onmessage = (event) => {
      const messageObj = JSON.parse(event.data)
      if (messageObj.event === 'transcription') {
        transcription.value = messageObj.transcription
        stopRecognize()
      }
    }

    socket.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    socket.value.onclose = () => {
      handleStopRecording()
    }

    const constraints = {
      video: false,
      audio: {
        channelCount: 1,
        echoCancellation: false,
        sampleRate: 16000,
      },
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaStream.value = stream
    mediaRecorder.value = new MediaRecorder(stream)
    mediaRecorder.value.ondataavailable = onDataAvailableHandler
    mediaRecorder.value.onstop = handleOnStopEvent
    // Send chunks every second
    mediaRecorder.value.start(chunkLength)
    isRecordingRef.value = true

    setTimeout(() => {
      if (isRecordingRef.value) {
        stopRecognize()
      }
    }, timesliceLimit.value * chunkLength)
  } catch (error) {
    console.error('Error during recording start:', error)
    return
  }
}

const stopRecognize = () => {
  handleStopRecording()

  try {
    console.log('Sending audio-chunk-end message...')
    socket.value?.send(JSON.stringify({ event: 'audio-chunk-end' }))
    isRecordingRef.value = false

    emitStoppedRecording()
  } catch (error) {
    console.error('Error during recording stop:', error)
    return
  }
}

const onDataAvailableHandler = (event: BlobEvent) => {
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

const handleStopRecording = () => {
  if (!mediaRecorder.value || !mediaStream.value) {
    return
  }

  if (
    mediaRecorder.value?.state === 'inactive' && 
    !isRecordingRef.value
  ) {
    return
  }

  try {
    mediaRecorder.value?.stop()
    mediaStream.value?.getTracks().forEach((track: MediaStreamTrack) => {
      track.stop()
    })
  } catch (error) {
    console.error('Error during recording stop:', error)
    return
  }
}

const emitStoppedRecording = (): void => {
  emit('stop-recognize', transcription.value)
}

const handleDialogCloseEvent = (): void => {
  emit('close')
}

const handleRecordingButtonClick = () => {
  if (isRecordingRef.value) {
    //dalay stop recording so that the last chunk is sent
    setTimeout(() => {
      stopRecognize()
    }, stopDelay)
  } else {
    startRecognize()
  }
}

const handleOnStopEvent = () => {
  stopRecognize()
}
</script>

<template>
  <div>
    <div v-if="props.isOpen" class="dialog-overlay">
      <div class="dialog-box">
        <button
          class="dialog-box-close-button"
          @click="handleDialogCloseEvent"
        >
        </button>
        
        <div class="dialog-content">
          <p class="listening-text">
            {{ description }}
          </p>

          <button 
            class="mic-button"
            :class="{ recording: isRecordingRef }"
            @click="handleRecordingButtonClick"
          >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
