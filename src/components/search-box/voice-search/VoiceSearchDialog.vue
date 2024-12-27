<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { VoiceSearchOptions } from '@/types/search-box/SearchBoxOptions';
import { getVoiceServiceApiUrl } from '@/utils/api.utils';

const socket = ref<WebSocket | null>(null)

const isRecordingRef = ref<boolean>(false)
const mediaStream = ref<MediaStream | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const timesliceLimit = ref<number>(3)
const timeSliceLength = 1000
const transcription = ref('')
const stopDelay = 700
const progressBar = ref<HTMLElement | null>(null)

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
  if (!isRecordingRef.value) {
    return 'Microphone is off. Try again.'
  }

  // at the moment the full transcript text is returned
  // so there is no point to show the transcription in real time
  return 'Listening...'
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
    
    mediaRecorder.value.onstart = startProgressBar
    mediaRecorder.value.ondataavailable = onDataAvailableHandler
    mediaRecorder.value.onstop = handleOnStopEvent
    
    // Send time slice every second
    mediaRecorder.value.start(timeSliceLength)
    isRecordingRef.value = true

    setTimeout(() => {
      if (isRecordingRef.value) {
        stopRecognize()
      }
    }, timesliceLimit.value * timeSliceLength)
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

// Get the color of the progress bar, since it is set from the 
// Lupa SCSS config var and not directly in the component
const getProgressBarColor = (progressBarStyle: any) => {
  if (!progressBarStyle.backgroundImage.startsWith('conic-gradient')) {
    return progressBarStyle.backgroundColor
  }

  const colorStops = progressBarStyle.backgroundImage
    .replace(/conic-gradient\(|\)$/g, '') // Remove the "conic-gradient(" and trailing ")"
    .split(')')

  if (colorStops.length > 1) {
    return `${colorStops[0]})`
  } else {
    return progressBarStyle.backgroundColor
  }
}

const startProgressBar = () => {
  if (!progressBar.value) {
    return
  }

  const duration = timesliceLimit.value * timeSliceLength

  const progressBarStyle = 
    window.getComputedStyle(progressBar.value);

  const progressBarColor = getProgressBarColor(progressBarStyle);
  progressBar.value.style.background = 
    `conic-gradient(${progressBarColor} 0%, transparent 0%)`
  
    let startTime = null

  function updateProgress(timestamp) {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1) * 100;
    progressBar.value.style.background =
      `conic-gradient(${progressBarColor} ${progress}%, transparent ${progress}%)`

    if (elapsed < duration) {
      requestAnimationFrame(updateProgress)
    }
  }

  requestAnimationFrame(updateProgress)
}

defineExpose({ startRecognize })
</script>

<template>
  <div>
    <div v-if="props.isOpen" class="dialog-overlay">
      <button
          class="dialog-box-close-button"
          @click="handleDialogCloseEvent"
        >
        </button>
        <div class="dialog-content">
          <p class="listening-text">
            {{ description }}
          </p>

          <div class="mic-button-wrapper">
            <button 
              class="mic-button"
              :class="{ recording: isRecordingRef }"
              @click="handleRecordingButtonClick"
            >
            </button>
            <div
              ref="progressBar" 
              class="progress-circle"
            ></div>
          </div>
        </div>
    </div>
  </div>
</template>
