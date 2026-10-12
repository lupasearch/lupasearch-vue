<script lang="ts" setup>
import { useDeepSearchOptions } from '@/composables/useDeepSearchOptions'
import { DEFAULT_OPTIONS_RESULTS } from '@/constants/searchResults.const'
import { useDeepSearchStore } from '@/stores/deepSearch'
import { useOptionsStore } from '@/stores/options'
import { useSearchResultStore } from '@/stores/searchResult'
import type { SearchResultsProductCardOptions } from '@/types/search-results/SearchResultsProductCardOptions'
import type { SearchResultsSortOptions } from '@/types/search-results/SearchResultsSort'
import { getLabeledFilters, unfoldFilters } from '@/utils/filter.utils'
import { findSortKey } from '@/utils/sort.utils'
import { getProductKey } from '@/utils/string.utils'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import SearchResultsProductCard from '../products/product-card/SearchResultsProductCard.vue'
import DeepSearchIcon from './DeepSearchIcon.vue'
import DeepSearchLoadingIndicator from './DeepSearchLoadingIndicator.vue'

const props = defineProps<{
  productCardOptions: SearchResultsProductCardOptions
  ssr?: boolean
}>()

const DEEP_SEARCH_CLICK_METADATA = { deepSearch: true }

const deepSearchStore = useDeepSearchStore()
const optionsStore = useOptionsStore()
const searchResultStore = useSearchResultStore()

const {
  bestProductsRequest,
  bestProductsResult,
  bestProductsLoading,
  bestProductsDeepSearch,
  bestProductsSuggestionsApplied,
  bestProductsExpanded
} = storeToRefs(deepSearchStore)
const { searchResultOptions, multiCurrency } = storeToRefs(optionsStore)
const { searchResult, columnCount } = storeToRefs(searchResultStore)
const { isBestProductsMode, isClickToTriggerMode, bestProductsOptions } = useDeepSearchOptions()

const labels = computed(() => bestProductsOptions.value.labels ?? {})

const items = computed(() => {
  return bestProductsOptions.value.showProducts === false
    ? []
    : (bestProductsResult.value?.items ?? [])
})

const explanation = computed(() => {
  if (!bestProductsDeepSearch.value) {
    return undefined
  }
  const aiExplanation = bestProductsOptions.value.showExplanation
    ? bestProductsDeepSearch.value.explanation
    : undefined
  return aiExplanation || labels.value.explanationFallback
})

const suggestedFilters = computed(() => {
  const filters = bestProductsDeepSearch.value?.filters
  if (!bestProductsOptions.value.showSuggestedFilters || !filters) {
    return []
  }
  const options = searchResultOptions.value
  return getLabeledFilters(
    unfoldFilters(filters, {
      keys: options?.priceKeys ?? [],
      currency: options?.labels?.currency ?? '',
      separator: options?.labels?.priceSeparator ?? '',
      currencyTemplate: options?.labels?.currencyTemplate ?? '',
      multiCurrency: multiCurrency.value
    }),
    searchResult.value.facets,
    options?.filters?.translations
  )
})

const suggestedSortLabel = computed(() => {
  const sort = bestProductsDeepSearch.value?.sort
  if (!bestProductsOptions.value.showSuggestedFilters || !sort?.length) {
    return undefined
  }
  const sortOptions = searchResultOptions.value?.sort
  const sortKey = findSortKey(sortOptions, sort)
  return (
    sortOptions?.find((option: SearchResultsSortOptions) => option.key === sortKey)?.label ??
    searchResultOptions.value?.labels?.suggestedSort ??
    DEFAULT_OPTIONS_RESULTS.labels.suggestedSort
  )
})

const sortByLabel = computed(() => searchResultOptions.value?.labels?.sortBy ?? '')

const showProductsToggle = computed(() => {
  return !bestProductsLoading.value && items.value.length > 0
})

const productsToggleLabel = computed(() => {
  return bestProductsExpanded.value ? labels.value.collapseProducts : labels.value.expandProducts
})

const hasSuggestions = computed(() => {
  return suggestedFilters.value.length > 0 || Boolean(suggestedSortLabel.value)
})

const showTrigger = computed(() => {
  return isClickToTriggerMode.value && !bestProductsResult.value && !bestProductsLoading.value
})

const hasContent = computed(() => {
  return items.value.length > 0 || hasSuggestions.value || Boolean(explanation.value)
})

const visible = computed(() => {
  return (
    isBestProductsMode.value &&
    Boolean(bestProductsRequest.value) &&
    (showTrigger.value || bestProductsLoading.value || hasContent.value)
  )
})

const cardOptions = computed((): SearchResultsProductCardOptions => {
  return {
    ...props.productCardOptions,
    ...bestProductsOptions.value.productCard,
    queryKey: bestProductsOptions.value.queryKey || props.productCardOptions.queryKey
  }
})

const columnSize = computed((): Record<string, string> => {
  // Programic grid disabled when ssr is on
  if (props.ssr) {
    return {}
  }
  const columns = Math.max(1, Math.min(items.value.length, columnCount.value))
  return { width: `${100 / columns}%` }
})
</script>

<template>
  <div
    v-if="visible"
    class="lupa-deep-search-best-products"
    data-cy="lupa-deep-search-best-products"
  >
    <button
      v-if="showTrigger"
      type="button"
      class="lupa-deep-search-best-products-trigger"
      data-cy="lupa-deep-search-best-products-trigger"
      @click="deepSearchStore.loadBestProducts()"
    >
      <DeepSearchIcon />
      <span class="lupa-deep-search-best-products-trigger-label">{{ labels.trigger }}</span>
    </button>
    <template v-else>
      <div class="lupa-deep-search-best-products-header">
        <DeepSearchIcon />
        <span class="lupa-deep-search-best-products-title">{{ labels.title }}</span>
        <button
          v-if="showProductsToggle"
          type="button"
          class="lupa-deep-search-best-products-toggle"
          :class="{ 'lupa-deep-search-best-products-toggle-expanded': bestProductsExpanded }"
          :aria-expanded="bestProductsExpanded"
          aria-controls="lupa-deep-search-best-products-items"
          data-cy="lupa-deep-search-best-products-toggle"
          @click="deepSearchStore.toggleBestProductsExpanded()"
        >
          {{ productsToggleLabel }}
        </button>
      </div>
      <DeepSearchLoadingIndicator
        v-if="bestProductsLoading"
        :label="labels.loading"
        :show-icon="false"
      />
      <template v-else>
        <p v-if="explanation" class="lupa-deep-search-best-products-explanation">
          {{ explanation }}
        </p>
        <div
          v-if="hasSuggestions"
          class="lupa-deep-search-best-products-suggestions"
          data-cy="lupa-deep-search-best-products-suggestions"
        >
          <span
            v-if="labels.suggestedFiltersTitle"
            class="lupa-deep-search-best-products-suggestions-title"
          >
            {{ labels.suggestedFiltersTitle }}
          </span>
          <span
            v-for="filter in suggestedFilters"
            :key="`${filter.key}-${filter.originalValue ?? filter.value}`"
            class="lupa-deep-search-best-products-suggestion"
          >
            <span class="lupa-deep-search-best-products-suggestion-label">{{ filter.label }}:</span>
            {{ filter.value }}
          </span>
          <span
            v-if="suggestedSortLabel"
            class="lupa-deep-search-best-products-suggestion lupa-deep-search-best-products-suggestion-sort"
          >
            <span v-if="sortByLabel" class="lupa-deep-search-best-products-suggestion-label">
              {{ sortByLabel }}
            </span>
            {{ suggestedSortLabel }}
          </span>
          <button
            v-if="labels.applyFilters && !bestProductsSuggestionsApplied"
            type="button"
            class="lupa-deep-search-best-products-apply"
            data-cy="lupa-deep-search-best-products-apply"
            @click="deepSearchStore.applyBestProductsSuggestions()"
          >
            {{ labels.applyFilters }}
          </button>
        </div>
        <div
          v-if="items.length && bestProductsExpanded"
          id="lupa-deep-search-best-products-items"
          class="lupa-deep-search-best-products-items"
          data-cy="lupa-deep-search-best-products-items"
        >
          <SearchResultsProductCard
            v-for="(product, index) in items"
            :key="getProductKey(`${index}`, product, cardOptions.idKey)"
            :style="columnSize"
            :product="product"
            :options="cardOptions"
            :analytics-metadata="DEEP_SEARCH_CLICK_METADATA"
          />
        </div>
      </template>
    </template>
  </div>
</template>
