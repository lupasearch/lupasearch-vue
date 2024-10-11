<script lang="ts" setup>
import { computed } from 'vue'
import { Document } from '@getlupa/client-sdk/Types'
import { SearchResultsProductOptions } from '@/types/search-results/SearchResultsOptions'
import { getProductKey } from '@/utils/string.utils'
import SearchResultsProductImage from '../search-results/products/product-card/elements/SearchResultsProductImage.vue'
import { generateLink } from '@/utils/link.utils'

const props = defineProps<{
  options: SearchResultsProductOptions
  searchResults: Document[]
}>()

const getProductKeyAction = (index: number, product: Document): string => {
  return getProductKey(`${index}`, product, props.options.idKey)
}

const image = computed(() => props.options.elements?.find((e) => e.type === 'image'))

const getLink = (item) => {
  if (!props.options.links?.details) {
    return ''
  }
  return generateLink(props.options.links?.details ?? '', item)
}
</script>

<template>
  <section class="lupa-chat-results">
    <div
      v-for="(product, index) in searchResults"
      class="lupa-chat-item lupa-chat-product-card-image"
      :key="getProductKeyAction(index, product)"
    >
      <a :href="getLink(product)">
        <SearchResultsProductImage :item="product" :options="image" />
      </a>
    </div>
  </section>
</template>
