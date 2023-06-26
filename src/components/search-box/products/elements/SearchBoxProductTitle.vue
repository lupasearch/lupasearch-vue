<script lang="ts" setup>
import { computed } from 'vue'
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
</script>
<template>
  <div class="lupa-search-box-product-title" v-if="isHtml" v-html="title"></div>
  <div v-else class="lupa-search-box-product-title">
    <strong>{{ title }}</strong>
  </div>
</template>
