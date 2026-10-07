<script lang="ts" setup>
import { useAiSearchOptions } from '@/composables/useAiSearchOptions'
import { useAiSearchStore } from '@/stores/aiSearch'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import AiSearchLoadingIndicator from './AiSearchLoadingIndicator.vue'

const aiSearchStore = useAiSearchStore()

const { aiSearchLoading } = storeToRefs(aiSearchStore)
const { isRegularMode, loaderType, regularOptions } = useAiSearchOptions()

const visible = computed(() => {
  return isRegularMode.value && loaderType.value === 'panel' && aiSearchLoading.value
})

const label = computed(() => regularOptions.value.labels?.loading)
</script>

<template>
  <Transition name="lupa-ai-search-fade">
    <div v-if="visible" class="lupa-ai-search-loading-panel" data-cy="lupa-ai-search-loading-panel">
      <AiSearchLoadingIndicator :label="label" />
    </div>
  </Transition>
</template>
