<script lang="ts" setup>
import { useParamsStore } from '@/stores/params'
import { useSearchBoxStore } from '@/stores/searchBox'
import type { InputSuggestion } from '@/types/search-box/Common'
import type { SearchBoxInputOptions } from '@/types/search-box/SearchBoxOptions'
import { storeToRefs } from 'pinia'
import { computed, ref, watch, onBeforeUnmount, onMounted } from 'vue'
import VoiceSearchDialog from '@/components/search-box/voice-search/VoiceSearchDialog.vue'

const props = defineProps<{
  options: SearchBoxInputOptions
  canClose?: boolean
  emitInputOnFocus?: boolean
  suggestedValue: InputSuggestion
}>()

const paramStore = useParamsStore()
const searchBoxStore = useSearchBoxStore()
const { query } = storeToRefs(paramStore)

const emit = defineEmits(['input', 'focus', 'search'])

const mainInput = ref(null)
const voiceDialogOverlay = ref(null)

const isVoiceDialogOpen = ref(false)

const emitInputOnFocus = computed(() => props.emitInputOnFocus ?? true)
const suggestedValue = computed(
  () => props.suggestedValue ?? { value: '', override: false, item: { suggestion: '' } }
)

const labels = computed(() => props.options.labels)
const input = ref('')

const inputValue = computed({
  get: () => input.value,
  set: (value) => {
    searchBoxStore.saveInputValue({ input: value })
    input.value = value
  }
})

const showHint = computed(
  () =>
    Boolean(inputValue.value) &&
    inputValue.value.length > 0 &&
    suggestedValue.value.item?.suggestion?.startsWith(inputValue.value)
)

const inputAttributes = computed(() => ({
  ...(props.options.inputAttributes ?? {})
}))

const ariaLabel = computed(() => labels.value.searchInputAriaLabel ?? 'Search input')

onMounted(() => {
  document.addEventListener('click', handleClickOutsideVoiceDialogOverlay)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutsideVoiceDialogOverlay)
})

watch(suggestedValue, () => {
  if (suggestedValue.value.override) {
    input.value = suggestedValue.value.item.suggestion
  }
})

watch(query, () => {
  inputValue.value = query.value
})

const handleInput = (evt?: Event): void => {
  const target = evt?.target as HTMLInputElement
  if (target) {
    inputValue.value = target.value
  }
  emit('input', inputValue.value)
}

const handleFocus = (): void => {
  emit('focus')
  if (emitInputOnFocus.value) {
    handleInput()
  }
}

const handleSubmit = (): void => {
  emit('search', { query: inputValue.value })
}

const clear = (): void => {
  emit('input', '')
}

const focus = (): void => {
  if (!mainInput.value) {
    return
  }
  ;(mainInput?.value as HTMLInputElement)?.focus()
}

const openVoiceSearchDialog = () => {
  isVoiceDialogOpen.value = true

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(voiceDialogOverlay.value as any)?.startRecognize()
}

const closeDialog = () => {
  isVoiceDialogOpen.value = false
}

const handleVoiceSearchOutput = (transcription: string): void => {
  inputValue.value = transcription
  handleSubmit()
}

const stopRecognition = (trascription: string) => {
  setTimeout(() => {
    isVoiceDialogOpen.value = false
    handleVoiceSearchOutput(trascription)
  }, 500);
}

const handleClickOutsideVoiceDialogOverlay = (event) => {
  if(event.target.classList.contains('voice-search-button')) {
    return
  }

  if (
    voiceDialogOverlay.value && 
    voiceDialogOverlay.value.$el.contains(event.target)
  ) {
    return
  }
  
  if (isVoiceDialogOpen.value) {
    closeDialog()
  }
}

defineExpose({ focus })
</script>
<template>
  <div id="lupa-search-box-input-container">
    <div class="lupa-input-clear">
      <div
        class="lupa-input-clear-content"
        :class="{ 'lupa-input-clear-filled': inputValue }"
        @click="clear"
      ></div>
    </div>
    <div id="lupa-search-box-input">
      <input
        class="lupa-hint"
        aria-hidden="true"
        :value="showHint ? suggestedValue.item.suggestion : ''"
        disabled
      />
      <input
        v-model="inputValue"
        v-bind="inputAttributes"
        ref="mainInput"
        autocomplete="off"
        :aria-label="ariaLabel"
        class="lupa-search-box-input-field"
        data-cy="lupa-search-box-input-field"
        type="text"
        :placeholder="labels.placeholder"
        @input="handleInput"
        @focus="handleFocus"
      />
      <button v-if="options.showSubmitButton" @click="handleSubmit">
        <span class="lupa-search-submit-icon"></span>
      </button>
    </div>
    <div v-if="canClose" class="lupa-close-search-container" @click="$emit('close')">
      <span v-if="labels.close" class="lupa-close-label">{{ labels.close }}</span>
    </div>
    <div v-if="props.options.voiceSearch.enabled">
      <button 
        @click="openVoiceSearchDialog" 
        class="voice-search-button"
      ></button>
    </div>
    <VoiceSearchDialog 
      v-if="props.options.voiceSearch.enabled"
      ref="voiceDialogOverlay"
      :isOpen="isVoiceDialogOpen"
      :options="props.options.voiceSearch"
      @close="closeDialog"
      @transcript-update="handleVoiceSearchOutput"
      @stop-recognize="stopRecognition"
    />
  </div>
</template>
