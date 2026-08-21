<script lang="ts" setup>
import { computed } from 'vue'
import type { CustomHtmlBadgeElement } from '@/types/search-results/BadgeOptions'
import { renderHtmlTemplate } from '@/utils/render.utils'
import { escapeDocumentValues } from '@/utils/escape.utils'
import { useAutoEscapeDocumentData } from '@/composables/useAutoEscapeDocumentData'

const props = defineProps<{ badge: CustomHtmlBadgeElement }>()

const { autoEscapeDocumentData } = useAutoEscapeDocumentData()

const product = computed(() => props.badge.product ?? {})

const escapedProduct = computed(() =>
  autoEscapeDocumentData.value && !props.badge.useRawHtml
    ? escapeDocumentValues(product.value)
    : product.value
)

const text = computed(() =>
  typeof props.badge.html === 'string'
    ? renderHtmlTemplate(props.badge.html, product.value)
    : props.badge.html?.(escapedProduct.value, product.value)
)

const className = computed((): string => {
  return props.badge.className ?? ''
})
</script>
<template>
  <div :class="className" v-html="text"></div>
</template>
