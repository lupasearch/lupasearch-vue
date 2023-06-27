<script lang="ts" setup>
import type { Document } from '@getlupa/client-sdk/Types'
import type { DescriptionDocumentElement } from '@/types/DocumentElement'
import { computed } from 'vue'

const props = defineProps<{ item: Document; options: DescriptionDocumentElement }>()

const description = computed((): unknown => {
  return props.item[props.options.key]
})

const isHtml = computed((): boolean => {
  return props.options?.isHtml ?? false
})
</script>
<template>
  <div class="lupa-search-box-product-description" v-if="isHtml" v-html="description"></div>
  <div class="lupa-search-box-product-description" v-else>
    {{ description }}
  </div>
</template>
