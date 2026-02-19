<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    style?: Record<string, string>
    lines?: number
  }>(),
  {
    lines: 1
  }
)
</script>

<template>
  <div class="lupa-skeleton-text-wrapper" :style="style">
    <div v-for="i in lines" :key="i" class="lupa-skeleton-line">
      <div class="lupa-skeleton-line__shimmer" />
    </div>
  </div>
</template>
