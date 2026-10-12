<script lang="ts" setup>
import { useDeepSearchOptions } from '@/composables/useDeepSearchOptions'
import { useDeepSearchStore } from '@/stores/deepSearch'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import DeepSearchIcon from './DeepSearchIcon.vue'

const deepSearchStore = useDeepSearchStore()

const { deepSearchActive, deepSearchLoading, currentExplanation } = storeToRefs(deepSearchStore)
const { isRegularMode, regularOptions } = useDeepSearchOptions()

const visible = computed(() => {
  return isRegularMode.value && deepSearchActive.value && !deepSearchLoading.value
})

const text = computed(() => {
  const explanation = regularOptions.value.showExplanation ? currentExplanation.value : undefined
  return explanation || regularOptions.value.labels?.explanationFallback
})

const clearLabel = computed(() => regularOptions.value.labels?.clear)
</script>

<template>
  <div v-if="visible" class="lupa-deep-search-panel" data-cy="lupa-deep-search-panel">
    <DeepSearchIcon />
    <span v-if="text" class="lupa-deep-search-panel-text">{{ text }}</span>
    <button
      v-if="clearLabel"
      type="button"
      class="lupa-deep-search-panel-clear"
      data-cy="lupa-deep-search-panel-clear"
      @click="deepSearchStore.clearDeepSearch()"
    >
      {{ clearLabel }}
    </button>
  </div>
</template>
