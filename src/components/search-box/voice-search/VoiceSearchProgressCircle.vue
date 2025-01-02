<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{
  isRecording: boolean
  timesliceLimit: number
  timeSliceLength: number
}>()

const progressBar = ref<HTMLElement | null>(null)

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
  if (!progressBar.value || !props.isRecording) {
    return
  }

  const duration = props.timesliceLimit * props.timeSliceLength

  const progressBarStyle = 
    window.getComputedStyle(progressBar.value);

  const progressBarColor = getProgressBarColor(progressBarStyle);
  progressBar.value.style.background = 
    `conic-gradient(${progressBarColor} 0%, transparent 0%)`
  
    let startTime = null

  function updateProgress(timestamp) {
    if (!progressBar.value || !props.isRecording) {
      return
    }

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

const stopProgressBar = () => {
  if (!progressBar.value) {
    return
  }

  progressBar.value.style.background = '';
}

defineExpose({
  startProgressBar,
  stopProgressBar
})
</script>

<template>
  <div
    ref="progressBar"
    class="lupa-progress-circle"
  ></div>
</template>
