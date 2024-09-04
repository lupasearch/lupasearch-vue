<script lang="ts" setup>
import { computed } from 'vue'
import type { CustomHtmlBadgeElement } from '@/types/search-results/BadgeOptions'
import { renderHtmlTemplate } from '@/utils/render.utils'

const props = defineProps<{ badge: CustomHtmlBadgeElement }>()

const text = computed(() =>
  typeof props.badge.html === 'string'
    ? renderHtmlTemplate(props.badge.html, props.badge.product ?? {})
    : props.badge.html?.(props.badge.product ?? {})
)

const className = computed((): string => {
  return props.badge.className ?? ''
})
</script>
<template>
  <div :class="className" v-html="text"></div>
</template>
