<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { VoiceSearchOptions } from '@/types/search-box/SearchBoxOptions';
import { getVoiceServiceApiUrl } from '@/utils/api.utils';
import VoiceSearchProgressCircle from '@/components/search-box/voice-search/VoiceSearchProgressCircle.vue'
import { useOptionsStore } from '@/stores/options'
import { getSocketClientId } from '@/utils/string.utils';

const props = defineProps<{
  isOpen: boolean,
  options: VoiceSearchOptions
}>()

const optionsStore = useOptionsStore()

const emit = defineEmits([
  'close',
  'transcript-update',
  'stop-recognize'
])

const socket = ref<WebSocket | null>(null)
const clientId = ref<string | null>(null)

const isRecordingRef = ref<boolean>(false)
const isFinishedRef = ref<boolean>(false)
const errorRef = ref<string | null>(null)
const mediaStream = ref<MediaStream | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)

const transcription = ref('')

const voiceSearchProgressBar = ref(null)

const timesliceLimit = computed(() => props.options.timesliceLimit ?? 4)
const timeSliceLength = computed(() => props.options.timesliceLength ?? 1000)
const stopDelay = computed(() => props.options.stopDelay ?? 700)
const labels = computed(() => props.options.labels ?? {});

const description = computed(() => {
  if (errorRef.value) {
    return errorRef.value
  }

  if (!isRecordingRef.value && !isFinishedRef.value) {
    return labels.value.microphoneOff ?? 
      'Microphone is off. Try again.'
  }

  // at the moment the full transcript text is returned
  // so there is no point to show the transcription in real time
  return labels.value.listening ?? 'Listening...'
})

watch(transcription, (newValue) => {
  emit('transcript-update', newValue)
})

onMounted(() => {
  clientId.value = getSocketClientId()
  reset()
})

const startRecognize = async () => {
  if (
    isRecordingRef.value ||
    (mediaRecorder.value && mediaRecorder.value.state === 'recording')
  ) {
    return
  }

  isFinishedRef.value = false
  transcription.value = ''
  errorRef.value = null

  try {
    const voiceServiceUrl = getVoiceServiceApiUrl(
      optionsStore.envOptions.environment, 
      props.options.customVoiceServiceUrl
    )
    socket.value = new WebSocket(
      `${voiceServiceUrl}?clientId=${clientId.value}&languageCode=${props.options.language ?? "en-US"}&connectionType=write-first`
    )

    socket.value.onmessage = onBackendSocketMessage
    socket.value.onerror = () => {
      errorRef.value = 'Error connecting to transcription service'
    }

    socket.value.onclose = () => {
      if (isRecordingRef.value) {
        stopMediaRecording()
      }
    }

    const constraints = {
      video: false,
      audio: {
        channelCount: 1,
        echoCancellation: true,
        sampleRate: 16000,
      },
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaStream.value = stream
    mediaRecorder.value = new MediaRecorder(stream, {
      mimeType: 'audio/webm; codecs=opus',
    })
    
    mediaRecorder.value.onstart = 
      (voiceSearchProgressBar.value as any)?.startProgressBar
    mediaRecorder.value.ondataavailable = onDataAvailableHandler
    mediaRecorder.value.onstop = () => {
      handleOnStopEvent();
      (voiceSearchProgressBar.value as any)?.stopProgressBar()
    }
    
    // Send time slice every second
    mediaRecorder.value.start(timeSliceLength.value)
    isRecordingRef.value = true

    setTimeout(() => {
      handleOnStopEvent()
    }, timesliceLimit.value * timeSliceLength.value)
  } catch (error) {
    console.error('Error during recording start:', error)
    return
  }
}

const stopRecognize = () => {
  stopMediaRecording()

  if (
    socket.value.readyState === WebSocket.CLOSED ||
    socket.value.readyState === WebSocket.CLOSING
  ) {
    console.warn("Cannot stop: Either not recording or socket not open.");
    return;
  }

  try {
    socket.value?.send(JSON.stringify({ event: 'audio-chunk-end' }))
    emitStoppedRecording()
  } catch (error) {
    console.error('Error during recording stop:', error)
    return
  }
}

const onBackendSocketMessage = (event) => {
  const messageObj = JSON.parse(event.data)
  if (messageObj.event === 'error') {
    errorRef.value = 'Server error during transcription'
    stopMediaRecording()
  }

  if (messageObj.event === 'transcription') {
    transcription.value = messageObj.transcription
    stopRecognize()
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

const stopMediaRecording = () => {
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
    isRecordingRef.value = false
    isFinishedRef.value = true
  } catch (error) {
    console.error('Error during recording stop:', error)
    return
  }
}

const emitStoppedRecording = (): void => {
  if (errorRef.value) {
    return
  }

  emit('stop-recognize', transcription.value)
}

const handleDialogCloseEvent = (): void => {
  emit('close')
}

const handleRecordingButtonClick = () => {
  if (isRecordingRef.value) {
    //delay stop recording so that the last chunk is sent
    setTimeout(() => {
      handleOnStopEvent()
    }, stopDelay.value)
  } else {
    startRecognize()
  }
}

const handleOnStopEvent = () => {
  if (isRecordingRef.value) {
    stopRecognize()
  }
}

const reset = () => {
  stopMediaRecording()
  transcription.value = ''
  errorRef.value = null
}

onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.close()
    socket.value = null
  }

  clientId.value = null
  reset()
})

defineExpose({ 
  handleRecordingButtonClick, 
  reset 
})
</script>

<template>
  <div>
    <div 
      v-if="props.isOpen" 
      class="lupa-dialog-overlay"
    >
      <button
          class="lupa-dialog-box-close-button"
          @click="handleDialogCloseEvent"
        >
      </button>
      <div class="lupa-dialog-content">
        <p class="lupa-listening-text">
          {{ description }}
        </p>

        <div class="lupa-mic-button-wrapper">
          <button 
            class="lupa-mic-button"
            :class="{ recording: isRecordingRef }"
            @click="handleRecordingButtonClick"
          >
          </button>
          <VoiceSearchProgressCircle
            ref="voiceSearchProgressBar" 
            class="lupa-progress-circle"
            :isRecording="isRecordingRef"
            :timesliceLimit="timesliceLimit"
            :timeSliceLength="timeSliceLength"
          />
        </div>
      </div>
    </div>
  </div>
</template>
