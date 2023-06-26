<script lang="ts" setup>
import type { BadgeGenerateSeed, BadgeOptions } from '@/types/search-results/BadgeOptions'
import { computed } from 'vue'

const props = defineProps<{ options: BadgeOptions; badge: BadgeGenerateSeed }>()

const image = computed((): string | undefined => {
  return props.options.generate?.image?.(props.badge) ?? ''
})

const showTitle = computed((): boolean => {
  return props.options.generate?.showTitle?.(props.badge) ?? true
})

const hasAdditionalText = computed((): boolean => {
  return Boolean(props.badge?.additionalText) && typeof props.badge?.additionalText === 'string'
})

const hasTitleText = computed((): boolean => {
  return Boolean(props.badge?.titleText) && typeof props.badge?.titleText === 'string'
})

const customClassName = computed((): string => {
  return props.options.generate?.customClass?.(props.badge) ?? ''
})
</script>
<template>
  <div
    class="lupa-dynamic-badge"
    :class="customClassName"
    :style="{ background: badge.backgroundColor, color: badge.color }"
  >
    <span class="lupa-badge-title">
      <img v-if="image" :src="image" /><span v-if="hasTitleText && showTitle">
        {{ badge.titleText }}</span
      ></span
    ><span v-if="hasAdditionalText" class="lupa-badge-full-text">{{ badge.additionalText }}</span>
  </div>
</template>
