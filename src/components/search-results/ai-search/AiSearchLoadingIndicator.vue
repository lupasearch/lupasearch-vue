<script lang="ts" setup>
import AiSearchIcon from './AiSearchIcon.vue'

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
    class="lupa-ai-search-loading"
    role="status"
    aria-live="polite"
    data-cy="lupa-ai-search-loading"
  >
    <AiSearchIcon v-if="showIcon" />
    <span class="lupa-ai-search-loading-label">{{ label }}</span>
    <span class="lupa-ai-search-loading-dots" aria-hidden="true">
      <span class="lupa-ai-search-loading-dot"></span>
      <span class="lupa-ai-search-loading-dot"></span>
      <span class="lupa-ai-search-loading-dot"></span>
    </span>
  </div>
</template>
