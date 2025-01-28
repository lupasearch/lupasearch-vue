<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, ComputedRef } from 'vue'
import type { Document } from '@getlupa/client-sdk/Types'
import { useSearchResultStore } from '@/stores/searchResult'
import { SearchResultsSimilarResultsLabels } from '@/types/search-results/SearchResultsOptions'
import { SearchResultsProductCardOptions } from '@/types/search-results/SearchResultsProductCardOptions'
import { getProductKey } from '@/utils/string.utils'
import SearchResultsProductCard from '../product-card/SearchResultsProductCard.vue'
import { EventSourceMetadata } from '@/types/search-box/Common'

const props = defineProps<{
  columnSize: string
  labels: SearchResultsSimilarResultsLabels
  productCardOptions: SearchResultsProductCardOptions
}>()

const searchResultStore = useSearchResultStore()
const { searchResult } = storeToRefs(searchResultStore)

const similarResults = computed(() => searchResult.value.similarResults)

const getDocumentKey = (index: number, product: Document): string => {
  return getProductKey(`${index}`, product, props.productCardOptions.idKey)
}

const clickMetadata: ComputedRef<EventSourceMetadata> = computed(() => {
  return {
    source: 'similarResults'
  }
})
</script>
<template>
  <div id="lupa-search-results-similar-results" data-cy="lupa-search-results-similar-results">
    <div class="lupa-similar-results-label">{{ labels.similarResultsLabel }}</div>
    <div class="lupa-products" data-cy="lupa-products">
      <SearchResultsProductCard
        v-for="(product, index) in similarResults.items"
        :style="columnSize"
        :key="getDocumentKey(index, product)"
        :product="product"
        :options="productCardOptions"
        :analytics-metadata="clickMetadata"
      />
    </div>
  </div>
</template>
