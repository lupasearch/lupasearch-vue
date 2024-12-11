<script lang="ts" setup>
import { ref } from 'vue'
import VoiceSearchDialog from './VoiceSearchDialog.vue'

const emits = defineEmits(['get-recognition-text'])

const isDialogOpen = ref(false)

const closeDialog = () => {
  isDialogOpen.value = false
}

const stopRecognition = (trascription: string) => {
  setTimeout(() => {
    isDialogOpen.value = false
    emits('get-recognition-text', trascription)
  }, 500);
}

const handleTranscriptionUpdate = (trascription: string) => {
  emits('get-recognition-text', trascription)
}

const openVoiceSearchDialog = () => {
  isDialogOpen.value = true
}
</script>

<template>
  <div>
    <button 
      @click="openVoiceSearchDialog" 
      class="voice-search-button"
    ></button>
    <VoiceSearchDialog 
      :isOpen="isDialogOpen" 
      @close="closeDialog"
      @transcript-update="handleTranscriptionUpdate"
      @stop-recognize="stopRecognition"
    />
  </div>
</template>
