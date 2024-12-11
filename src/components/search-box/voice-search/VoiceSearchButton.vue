<script lang="ts" setup>
import { ref } from 'vue'
import VoiceSearchDialog from './VoiceSearchDialog.vue'
import { VoiceSearchOptions } from '@/types/search-box/SearchBoxOptions';

const props = defineProps<{
  options: VoiceSearchOptions
}>()

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
  <div v-if="props.options.enabled">
    <button 
      @click="openVoiceSearchDialog" 
      class="voice-search-button"
    ></button>
    <VoiceSearchDialog 
      :isOpen="isDialogOpen" 
      :options="props.options"
      @close="closeDialog"
      @transcript-update="handleTranscriptionUpdate"
      @stop-recognize="stopRecognition"
    />
  </div>
</template>
