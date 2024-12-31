<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { VoiceSearchOptions } from '@/types/search-box/SearchBoxOptions';
import { getVoiceServiceApiUrl } from '@/utils/api.utils';
import VoiceSearchProgressCircle from '@/components/search-box/voice-search/VoiceSearchProgressCircle.vue'
import { useOptionsStore } from '@/stores/options'

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

const isRecordingRef = ref<boolean>(false)
const mediaStream = ref<MediaStream | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)

const transcription = ref('')

const voiceSearchProgressBar = ref(null)

const timesliceLimit = computed(() => props.options.timesliceLimit ?? 4)
const timeSliceLength = computed(() => props.options.timesliceLength ?? 1000)
const stopDelay = computed(() => props.options.stopDelay ?? 700)
const labels = computed(() => props.options.labels ?? {});

const description = computed(() => {
  if (!isRecordingRef.value) {
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

const startRecognize = async () => {
  if (
    isRecordingRef.value ||
    (mediaRecorder.value && mediaRecorder.value.state === 'recording')
  ) {
    return
  }

  try {
    const voiceServiceUrl = getVoiceServiceApiUrl(
      optionsStore.envOptions.environment, 
      props.options.customVoiceServiceUrl
    )
    socket.value = new WebSocket(
      `${voiceServiceUrl}?lang=${props.options.language ?? "en-US"}&connectionType=write-first`
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
    
    mediaRecorder.value.onstart = 
      (voiceSearchProgressBar.value as any).startProgressBar
    mediaRecorder.value.ondataavailable = onDataAvailableHandler
    mediaRecorder.value.onstop = handleOnStopEvent
    
    // Send time slice every second
    mediaRecorder.value.start(timeSliceLength.value)
    isRecordingRef.value = true

    setTimeout(() => {
      if (isRecordingRef.value) {
        stopRecognize()
      }
    }, timesliceLimit.value * timeSliceLength.value)
  } catch (error) {
    console.error('Error during recording start:', error)
    return
  }
}

const stopRecognize = () => {
  handleStopRecording()

  try {
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

const stopMediaRecording = () => {
  if (!mediaRecorder.value || !mediaStream.value) {
    return
  }

  mediaRecorder.value?.stop()
  mediaStream.value?.getTracks().forEach((track: MediaStreamTrack) => {
    track.stop()
  })
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
    stopMediaRecording()
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
    }, stopDelay.value)
  } else {
    startRecognize()
  }
}

const handleOnStopEvent = () => {
  stopRecognize()
}

onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.close()
  }

  stopMediaRecording()
})

defineExpose({ startRecognize })
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
            :timesliceLimit="timesliceLimit"
            :timeSliceLength="timeSliceLength"
          />
        </div>
      </div>
    </div>
  </div>
</template>
