<script lang="ts" setup>
import { SearchResultsProductOptions } from '@/types/search-results/SearchResultsOptions'
import { getProductKey } from '@/utils/string.utils'
import { Document } from '@getlupa/client-sdk/Types'
import SearchResultsProductCard from '../search-results/products/product-card/SearchResultsProductCard.vue'

const props = defineProps<{
  options: SearchResultsProductOptions
  searchResults: Document[]
}>()

const getProductKeyAction = (index: number, product: Document): string => {
  return getProductKey(`${index}`, product, props.options.idKey)
}
</script>

<template>
  <section class="lupa-chat-results">
    <SearchResultsProductCard
      v-for="(product, index) in searchResults"
      class="lupa-chat-product-card"
      :key="getProductKeyAction(index, product)"
      :product="product"
      :options="options"
    />
  </section>
</template>
