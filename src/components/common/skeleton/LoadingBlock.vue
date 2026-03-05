<script lang="ts" setup>
import SkeletonBlock from '../skeleton/SkeletonBlock.vue'
import SkeletonText from './SkeletonText.vue'

const props = defineProps<{
  style?: Record<string, string>
  type?: 'text' | 'block'
  enabled: boolean
  loading: boolean
  count: number
}>()
</script>
<template>
  <slot v-if="!loading || !enabled" />
  <div v-else-if="type === 'text'" class="lupa-skeleton-text">
    <SkeletonText :style="style" :lines="count" />
  </div>
  <div v-else class="lupa-skeleton-blocks">
    <SkeletonBlock v-for="n in count" :key="n" :style="style" />
  </div>
</template>
