<script lang="ts" setup>
import { ref } from 'vue'
import VoiceSearchDialog from './VoiceSearchDialog.vue'

const emits = defineEmits(['send-recognition-text'])

const isDialogOpen = ref(false)

const closeDialog = () => {
  isDialogOpen.value = false
}

const stopRecognition = (trascription: string) => {
  isDialogOpen.value = false
  emits('send-recognition-text', trascription)
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
      @stop-recognition="stopRecognition"
    />
  </div>
</template>
