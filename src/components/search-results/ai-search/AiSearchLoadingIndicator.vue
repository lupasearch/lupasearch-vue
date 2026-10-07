<script lang="ts" setup>
import AiSearchIcon from './AiSearchIcon.vue'

defineProps<{
  label?: string
}>()
</script>

<template>
  <div
    class="lupa-ai-search-loading"
    role="status"
    aria-live="polite"
    data-cy="lupa-ai-search-loading"
  >
    <AiSearchIcon />
    <span class="lupa-ai-search-loading-label">{{ label }}</span>
    <span class="lupa-ai-search-loading-dots" aria-hidden="true">
      <span class="lupa-ai-search-loading-dot"></span>
      <span class="lupa-ai-search-loading-dot"></span>
      <span class="lupa-ai-search-loading-dot"></span>
    </span>
  </div>
</template>
