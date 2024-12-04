<script lang="ts" setup>
import { useParamsStore } from '@/stores/params'
import { useSearchBoxStore } from '@/stores/searchBox'
import type { InputSuggestion } from '@/types/search-box/Common'
import type { SearchBoxInputOptions } from '@/types/search-box/SearchBoxOptions'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import VoiceSearchButton from '@/components/search-box/voice-search/VoiceSearchButton.vue'

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

const handleVoiceSearchOutput = (transcription: string): void => {
  inputValue.value = transcription
  handleSubmit()
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
    <VoiceSearchButton
      v-if="options.voiceSearch.enabled"
      :options="options.voiceSearch"
      @send-recognition-text="handleVoiceSearchOutput"
    />
  </div>
</template>
