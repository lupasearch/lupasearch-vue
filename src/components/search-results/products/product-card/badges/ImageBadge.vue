<script lang="ts" setup>
import type { ImageBadgeElement } from '@/types/search-results/BadgeOptions'
import { computed } from 'vue'

const props = defineProps<{ badge: ImageBadgeElement }>()

const badges = computed((): string[] => {
  return Array.isArray(props.badge.value)
    ? (props.badge.value as unknown as string[])
    : [props.badge.value]
})

const displayBadges = computed((): string[] => {
  return badges.value.slice(0, props.badge.maxItems)
})

const getImageUrl = (src: string): string => {
  if (!props.badge.rootImageUrl) {
    return src
  }
  return `${props.badge.rootImageUrl}${src}`
}
</script>

<template>
  <div class="lupa-image-badges">
    <div class="lupa-badge lupa-image-badge" v-for="item in displayBadges" :key="item">
      <img :src="getImageUrl(item)" />
    </div>
  </div>
</template>
