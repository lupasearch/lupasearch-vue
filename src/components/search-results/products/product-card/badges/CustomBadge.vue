<script lang="ts" setup>
import { computed } from 'vue'
import type { CustomHtmlBadgeElement } from '@/types/search-results/BadgeOptions'

const props = defineProps<{ badge: CustomHtmlBadgeElement }>()

const text = computed((): string => {
  return props.badge.html?.(props.badge.product ?? {})
})

const className = computed((): string => {
  return props.badge.className ?? ''
})
</script>
<template>
  <div :class="className" v-html="text"></div>
</template>
