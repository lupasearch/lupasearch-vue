<script lang="ts" setup>
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import type { InputSuggestionFacet } from '@/types/search-box/Common'
import type { SearchResultsSimilarQueriesLabels } from '@/types/search-results/SearchResultsOptions'
import type { SearchResultsProductCardOptions } from '@/types/search-results/SearchResultsProductCardOptions'
import { escapeHtml, getProductKey } from '@/utils/string.utils'
import type { Document } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import SimilarQueryText from './SimilarQueryText.vue'
import SearchResultsProductCard from '../product-card/SearchResultsProductCard.vue'

const props = defineProps<{
  labels: SearchResultsSimilarQueriesLabels
  columnSize: string
  productCardOptions: SearchResultsProductCardOptions
}>()

const searchResultStore = useSearchResultStore()
const paramsStore = useParamsStore()

const { searchResult } = storeToRefs(searchResultStore)

const similarQueries = computed(() => searchResult.value.similarQueries)

const getDocumentKey = (index: number, product: Document): string => {
  return getProductKey(`${index}`, product, props.productCardOptions.idKey)
}

const similarQueryLabel = computed(() => {
  return props.labels.similarQuery?.replace('{1}', '') ?? ''
})

const getSimilarQueryContent = (displayQuery: string) => {
  return escapeHtml(displayQuery)
}

const goToResults = ({
  searchText,
  facet
}: {
  searchText: string
  facet?: InputSuggestionFacet
}) => {
  paramsStore.goToResults({ searchText, facet })
}
</script>
<template>
  <div id="lupa-search-results-similar-queries" data-cy="lupa-search-results-similar-queries">
    <div class="lupa-similar-queries-label">{{ labels.similarQueries }}</div>
    <div v-for="(similarQuery, index) in similarQueries" :key="index">
      <div class="lupa-similar-query-label" data-cy="lupa-similar-query-label">
        <span>
          {{ similarQueryLabel }}
        </span>
        <span
          id="lupa-similar-query-text-component"
          class="lupa-similar-query-value lupa-similar-query-link"
          @click="goToResults({ searchText: similarQuery.query })"
          data-cy="lupa-similar-query-value"
        >
          <span v-html="getSimilarQueryContent(similarQuery.displayQuery)" />
          <span v-if="similarQuery.count">&nbsp;({{ similarQuery.count }})</span>
        </span>
      </div>
      <div class="lupa-products" data-cy="lupa-products">
        <SearchResultsProductCard
          v-for="(product, index) in similarQuery.items"
          :style="columnSize"
          :key="getDocumentKey(index, product)"
          :product="product"
          :options="productCardOptions"
        />
      </div>
    </div>
  </div>
</template>
