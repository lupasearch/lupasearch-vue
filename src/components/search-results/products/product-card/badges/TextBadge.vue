<script lang="ts" setup>
import { computed } from 'vue'
import type { TextBadgeElement } from '@/types/search-results/BadgeOptions'

const props = defineProps<{ badge: TextBadgeElement }>()

const badges = computed((): string[] => {
  return (props.badge?.value as unknown as string[]) ?? []
})

const displayBadges = computed((): string[] => {
  return badges.value.slice(0, props.badge.maxItems)
})
</script>

<template>
  <div class="lupa-text-badges">
    <div class="lupa-badge lupa-text-badge" v-for="item in displayBadges" :key="item">
      {{ badge.prefix }}{{ item }}
    </div>
  </div>
</template>
