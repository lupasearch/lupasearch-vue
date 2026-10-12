<script lang="ts" setup>
import DeepSearchIcon from './DeepSearchIcon.vue'

withDefaults(
  defineProps<{
    label?: string
    showIcon?: boolean
  }>(),
  { label: undefined, showIcon: true }
)
</script>

<template>
  <div
    class="lupa-deep-search-loading"
    role="status"
    aria-live="polite"
    data-cy="lupa-deep-search-loading"
  >
    <DeepSearchIcon v-if="showIcon" />
    <span class="lupa-deep-search-loading-label">{{ label }}</span>
    <span class="lupa-deep-search-loading-dots" aria-hidden="true">
      <span class="lupa-deep-search-loading-dot"></span>
      <span class="lupa-deep-search-loading-dot"></span>
      <span class="lupa-deep-search-loading-dot"></span>
    </span>
  </div>
</template>
