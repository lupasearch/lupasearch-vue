<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { VoiceSearchOptions } from '@/types/search-box/SearchBoxOptions'
import { getVoiceServiceApiUrl } from '@/utils/api.utils'
import VoiceSearchProgressCircle from '@/components/search-box/voice-search/VoiceSearchProgressCircle.vue'
import { useOptionsStore } from '@/stores/options'
import { getSocketClientId } from '@/utils/string.utils'
import { useVoiceRecorder } from '@/composables/useVoiceRecorder'

const props = defineProps<{
  isOpen: boolean
  options: VoiceSearchOptions
}>()

const optionsStore = useOptionsStore()

const {
  isRecording,
  isSocketReady,
  transcription,
  errorRef,
  initSocket,
  stopSocketConnection,
  reset
} = useVoiceRecorder(props.options)

const emit = defineEmits(['close', 'transcript-update', 'stop-recognize'])

const clientId = ref<string | null>(null)

const voiceSearchProgressBar = ref(null)

const timesliceLimit = computed(() => props.options.timesliceLimit ?? 4)
const timeSliceLength = computed(() => props.options.timesliceLength ?? 1000)
const stopDelay = computed(() => props.options.stopDelay ?? 700)
const labels = computed(() => props.options.labels ?? {})

const description = computed(() => {
  if (errorRef.value) {
    return errorRef.value
  }

  if (!isSocketReady.value || !isRecording.value) {
    return labels.value.connecting ?? 'Connecting...'
  }

  // at the moment the full transcript text is returned
  // so there is no point to show the transcription in real time
  return labels.value.listening ?? 'Listening...'
})

watch(transcription, (newValue) => {
  emit('transcript-update', newValue)
})

watch(isRecording, (newVal) => {
  if (newVal === true) {
    ;(voiceSearchProgressBar.value as any)?.startProgressBar()
  } else {
    ;(voiceSearchProgressBar.value as any)?.stopProgressBar()
  }
})

const handleRecordingButtonClick = () => {
  if (isRecording.value) {
    //delay stop recording so that the last chunk is sent
    setTimeout(() => {
      stopSocketConnection()
      handleOnStopEvent()
    }, stopDelay.value)

    return
  }

  const voiceServiceUrl = getVoiceServiceApiUrl(
    optionsStore.envOptions.environment,
    props.options.customVoiceServiceUrl
  )
  const socketUrl = `${voiceServiceUrl}?clientId=${clientId.value}&queryKey=${
    props.options.queryKey
  }&languageCode=${props.options.language ?? 'en-US'}&connectionType=write-first`
  initSocket(socketUrl)

  setTimeout(() => {
    stopSocketConnection()
    handleOnStopEvent()
  }, timesliceLimit.value * timeSliceLength.value)
}

const handleOnStopEvent = () => {
  setTimeout(() => {
    if (errorRef.value) return
    emit('stop-recognize', transcription.value)
  }, 1500)
  ;(voiceSearchProgressBar.value as any)?.stopProgressBar()
}

onMounted(() => {
  clientId.value = getSocketClientId()
})

onBeforeUnmount(() => {
  clientId.value = null
})

const dialogReset = () => {
  reset()
  ;(voiceSearchProgressBar.value as any)?.stopProgressBar()
}

defineExpose({
  handleRecordingButtonClick,
  reset: dialogReset
})
</script>

<template>
  <div>
    <div v-if="props.isOpen" class="lupa-dialog-overlay">
      <button class="lupa-dialog-box-close-button" @click="() => emit('close')"></button>
      <div class="lupa-dialog-content">
        <p class="lupa-listening-text">
          {{ description }}
        </p>

        <div class="lupa-mic-button-wrapper">
          <button
            class="lupa-mic-button"
            :class="{ recording: isRecording }"
            @click="handleRecordingButtonClick"
            aria-controls="voice-search-microphone"
            :aria-label="labels?.aria?.microphone || 'Toggle microphone'"
          ></button>
          <VoiceSearchProgressCircle
            ref="voiceSearchProgressBar"
            class="lupa-progress-circle"
            :isRecording="isRecording"
            :timesliceLimit="timesliceLimit"
            :timeSliceLength="timeSliceLength"
          />
        </div>
      </div>
    </div>
  </div>
</template>
