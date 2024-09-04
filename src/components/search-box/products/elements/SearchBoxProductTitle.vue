<script lang="ts" setup>
import { computed } from 'vue'
import sanitizeHtml from 'sanitize-html'
import type { TitleDocumentElement } from '@/types/DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'

const props = defineProps<{
  item: Document
  options: TitleDocumentElement
}>()

const title = computed((): unknown => {
  return props.item[props.options.key]
})

const isHtml = computed((): boolean => {
  return props.options.isHtml ?? false
})

const sanitizedTitle = computed((): string => {
  return sanitizeHtml(title.value) as string
})
</script>
<template>
  <div class="lupa-search-box-product-title" v-if="isHtml" v-html="sanitizedTitle"></div>
  <div v-else class="lupa-search-box-product-title">
    <strong>{{ title }}</strong>
  </div>
</template>
