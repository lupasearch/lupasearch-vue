<script lang="ts" setup>
import { useAiSearchOptions } from '@/composables/useAiSearchOptions'
import { useAiSearchStore } from '@/stores/aiSearch'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import AiSearchIcon from './AiSearchIcon.vue'

const aiSearchStore = useAiSearchStore()

const { aiSearchActive, aiSearchLoading, currentExplanation } = storeToRefs(aiSearchStore)
const { isRegularMode, regularOptions } = useAiSearchOptions()

const visible = computed(() => {
  return isRegularMode.value && aiSearchActive.value && !aiSearchLoading.value
})

const text = computed(() => {
  const explanation = regularOptions.value.showExplanation ? currentExplanation.value : undefined
  return explanation || regularOptions.value.labels?.explanationFallback
})

const clearLabel = computed(() => regularOptions.value.labels?.clear)
</script>

<template>
  <div v-if="visible" class="lupa-ai-search-panel" data-cy="lupa-ai-search-panel">
    <AiSearchIcon />
    <span v-if="text" class="lupa-ai-search-panel-text">{{ text }}</span>
    <button
      v-if="clearLabel"
      type="button"
      class="lupa-ai-search-panel-clear"
      data-cy="lupa-ai-search-panel-clear"
      @click="aiSearchStore.clearAiSearch()"
    >
      {{ clearLabel }}
    </button>
  </div>
</template>
