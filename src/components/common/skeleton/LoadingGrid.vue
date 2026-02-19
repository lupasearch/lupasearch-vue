<script lang="ts" setup>
import SkeletonBlock from '../skeleton/SkeletonBlock.vue'

const props = defineProps<{
  style?: Record<string, string>
  enabled: boolean
  loading: boolean
  count: number
}>()
</script>
<template>
  <slot v-if="!loading || !enabled" />
  <div v-else class="lupa-skeleton-grid">
    <SkeletonBlock v-for="n in count" :key="n" :style="style" />
  </div>
</template>
