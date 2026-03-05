<script lang="ts" setup>
const props = defineProps<{
  style?: Record<string, string>
}>()
</script>

<template>
  <div class="lupa-skeleton-block-wrapper" :style="style">
    <div class="lupa-skeleton-block">
      <div class="lupa-skeleton-block__shimmer" />
    </div>
  </div>
</template>
