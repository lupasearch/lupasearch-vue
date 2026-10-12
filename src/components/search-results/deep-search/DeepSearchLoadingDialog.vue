<script lang="ts" setup>
import { useDeepSearchOptions } from '@/composables/useDeepSearchOptions'
import { useDeepSearchStore } from '@/stores/deepSearch'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import DeepSearchLoadingIndicator from './DeepSearchLoadingIndicator.vue'

const deepSearchStore = useDeepSearchStore()

const { deepSearchLoading } = storeToRefs(deepSearchStore)
const { isRegularMode, loaderType, regularOptions } = useDeepSearchOptions()

const visible = computed(() => {
  return isRegularMode.value && loaderType.value === 'dialog' && deepSearchLoading.value
})

const label = computed(() => regularOptions.value.labels?.loading)
</script>

<template>
  <Transition name="lupa-deep-search-fade">
    <div
      v-if="visible"
      class="lupa-deep-search-loading-overlay"
      data-cy="lupa-deep-search-loading-overlay"
    >
      <div
        class="lupa-deep-search-loading-dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
      >
        <DeepSearchLoadingIndicator :label="label" />
      </div>
    </div>
  </Transition>
</template>
