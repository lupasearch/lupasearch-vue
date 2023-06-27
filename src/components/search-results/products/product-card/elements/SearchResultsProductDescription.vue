<script lang="ts" setup>
import type { DescriptionDocumentElement } from '@/types/DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'
import { computed } from 'vue'

const props = defineProps<{ item: Document; options: DescriptionDocumentElement }>()

const description = computed((): unknown => {
  return props.item[props.options.key]
})

const isHtml = computed((): boolean => {
  return props.options.isHtml ?? false
})

const maxLines = computed((): number => {
  return props.options.maxLines
})
</script>

<template>
  <div
    class="lupa-search-results-product-description"
    :style="`-webkit-line-clamp: ${maxLines}`"
    v-if="isHtml"
    v-html="description"
  ></div>
  <div
    class="lupa-search-results-product-description"
    :style="`-webkit-line-clamp: ${maxLines}`"
    v-else
  >
    {{ description }}
  </div>
</template>
