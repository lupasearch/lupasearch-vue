<script lang="ts" setup>
import ProductImage from '@/components/common/ProductImage.vue'
import type { ImageDocumentElement } from '@/types/DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'

defineProps<{ item: Document; options: ImageDocumentElement }>()
</script>

<template>
  <ProductImage
    :item="item"
    :options="options"
    wrapper-class="lupa-search-results-image-wrapper"
    image-class="lupa-search-results-image"
  />
</template>
