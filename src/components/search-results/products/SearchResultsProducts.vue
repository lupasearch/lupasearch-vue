<script lang="ts" setup>
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import { ResultsLayoutEnum } from '@/types/search-results/ResultsLayout'
import type {
  ResultCurrentFilterOptions,
  SearchResultsOptions,
  SearchResultsSimilarQueriesLabels,
  SearchResultsSimilarResultsLabels
} from '@/types/search-results/SearchResultsOptions'
import type { Document } from '@getlupa/client-sdk/Types'
import type { SearchResultsProductCardOptions } from '@/types/search-results/SearchResultsProductCardOptions'
import { pick } from '@/utils/picker.utils'
import { getProductKey } from '@/utils/string.utils'
import { storeToRefs } from 'pinia'
import { computed, ComputedRef } from 'vue'
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import FiltersTopDropdown from '../filters/FiltersTopDropdown.vue'
import SearchResultsToolbar from './SearchResultsToolbar.vue'
import CurrentFilters from '../filters/CurrentFilters.vue'
import SearchResultsProductCard from './product-card/SearchResultsProductCard.vue'
import SearchResultsSimilarQueries from './similar-queries/SearchResultsSimilarQueries.vue'
import AdditionalPanels from '../additional-panels/AdditionalPanels.vue'
import Spinner from '@/components/common/Spinner.vue'
import { useOptionsStore } from '@/stores/options'
import SearchResultsSimilarResults from './similar-results/SearchResultsSimilarResults.vue'
import RelatedQueries from '@/components/search-results/related-queries/RelatedQueries.vue'
import RedirectionSuggestions from '../redirection-suggestions/RedirectionSuggestions.vue'
import { EventSourceMetadata } from '@/types/search-box/Common'
import RefinersLoadingNotice from './RefinersLoadingNotice.vue'
import RelatedQueriesApi from '../related-queries/RelatedQueriesApi.vue'
import ZeroResults from './ZeroResults.vue'
import LoadingGrid from '@/components/common/skeleton/LoadingGrid.vue'
import { useLoadingSkeleton } from '@/composables/useLoadingSkeleton'
import LoadingBlock from '@/components/common/skeleton/LoadingBlock.vue'

const props = defineProps<{
  options: SearchResultsOptions
  ssr?: boolean
}>()

const searchResultStore = useSearchResultStore()
const paramStore = useParamsStore()
const optionStore = useOptionsStore()

const {
  hasResults,
  currentQueryText,
  isPageEmpty,
  isFilterSidebarVisible,
  columnCount,
  searchResult,
  layout,
  loading,
  relatedQueriesApiEnabled
} = storeToRefs(searchResultStore)

const { limit, skeletonEnabled, relatedQueriesSkeletonEnabled, loadingAny } = useLoadingSkeleton()

const emit = defineEmits(['filter'])

const productCardOptions = computed((): SearchResultsProductCardOptions => {
  return pick(props.options, [
    'isInStock',
    'badges',
    'links',
    'elements',
    'labels',
    'queryKey',
    'idKey',
    'titleKey',
    'isLink',
    'routingBehavior',
    'customDocumentHtmlAttributes'
  ])
})

const similarQueriesLabels = computed((): SearchResultsSimilarQueriesLabels => {
  return props.options.labels
})

const similarResultsLabels = computed((): SearchResultsSimilarResultsLabels => {
  return props.options.labels
})

const showTopFilters = computed((): boolean => {
  return props.options.filters?.facets?.style?.type !== 'sidebar'
})

const currentFilterToolbarVisible = computed((): boolean => {
  return Boolean(
    props.options.filters?.currentFilters?.visibility?.mobileToolbar ||
      props.options.filters?.currentFilters?.visibility?.desktopToolbar
  )
})

const currentFilterOptions = computed((): ResultCurrentFilterOptions | undefined => {
  return currentFilterToolbarVisible.value ? props.options.filters?.currentFilters : undefined
})

const currentFilterPositionDesktop = computed((): string => {
  return props.options.filters?.currentFilters?.desktopToolbar?.position || 'pageTop'
})

const currentFiltersClass = computed((): string => {
  if (!currentFilterToolbarVisible.value) {
    return ''
  }
  if (
    props.options.filters?.currentFilters?.visibility?.mobileToolbar &&
    props.options.filters?.currentFilters?.visibility?.desktopToolbar
  ) {
    return 'lupa-toolbar-filters'
  }

  return props.options.filters?.currentFilters?.visibility?.mobileToolbar
    ? 'lupa-filters-mobile'
    : 'lupa-toolbar-filters-desktop'
})

const desktopFiltersExpanded = computed((): boolean => {
  return props.options?.filters?.currentFilters?.desktopToolbar?.activeFiltersExpanded ?? false
})

const columnSize = computed((): Record<string, string> => {
  // Programic grid disabled when ssr is on
  if (props.ssr) {
    return {}
  }
  if (layout.value === ResultsLayoutEnum.LIST) {
    return { width: '100%' }
  }
  return { width: `${100 / columnCount.value}%` }
})

const hasSimilarQueries = computed(() => Boolean(searchResult.value.similarQueries?.length))

const hasSimilarResults = computed(() => Boolean(searchResult.value.similarResults?.items?.length))

const clickMetadata: ComputedRef<EventSourceMetadata> = computed(() => {
  const hasDidYouMean = Boolean(searchResult.value.suggestedSearchText)
  return hasDidYouMean
    ? {
        _lupaEventSource: 'didYouMean',
        _lupaUpdatedQuery: searchResult.value.suggestedSearchText
      }
    : undefined
})

const showLocalRelatedQueries = computed((): boolean => {
  return Boolean(props.options.relatedQueries?.source && relatedQueriesApiEnabled.value === false)
})

const showApiRelatedQueries = computed((): boolean => {
  return Boolean(relatedQueriesApiEnabled.value === true) && Boolean(props.options.relatedQueries)
})

const getProductKeyAction = (index: number, product: Document): string => {
  return getProductKey(`${index}`, product, props.options.idKey)
}

const goToFirstPage = (): void => {
  paramStore.appendParams({
    params: [{ name: optionStore.getQueryParamName(QUERY_PARAMS.PAGE), value: '1' }]
  })
}

const filter = () => {
  emit('filter')
}
</script>
<template>
  <div id="lupa-search-results-products">
    <Spinner v-if="!skeletonEnabled && loading && !isFilterSidebarVisible" class="lupa-loader" />
    <RedirectionSuggestions :options="options.redirectionSuggestions" />
    <AdditionalPanels :options="options" location="top" :sdk-options="options.options" />
    <LoadingBlock
      :enabled="relatedQueriesSkeletonEnabled"
      :loading="loadingAny"
      :count="1"
      class="lupa-skeleton-related-queries"
    >
      <RelatedQueries v-if="showLocalRelatedQueries" :options="options.relatedQueries" />
      <RelatedQueriesApi v-if="showApiRelatedQueries" :options="options.relatedQueries" />
    </LoadingBlock>
    <template v-if="hasResults">
      <FiltersTopDropdown v-if="showTopFilters" :options="options.filters ?? {}" />
      <SearchResultsToolbar
        class="lupa-toolbar-mobile"
        :options="options"
        pagination-location="top"
        @filter="filter"
      />
      <CurrentFilters
        v-if="currentFilterOptions && currentFilterPositionDesktop === 'pageTop'"
        :class="currentFiltersClass"
        data-cy="lupa-search-result-filters-mobile-toolbar"
        :options="currentFilterOptions"
        :expandable="!desktopFiltersExpanded"
      />
    </template>
    <template v-if="hasResults">
      <SearchResultsToolbar class="lupa-toolbar-top" :options="options" pagination-location="top" />
      <CurrentFilters
        v-if="currentFilterOptions && currentFilterPositionDesktop === 'resultsTop'"
        :class="currentFiltersClass"
        data-cy="lupa-search-result-filters-mobile-toolbar"
        :options="currentFilterOptions"
        :expandable="!desktopFiltersExpanded"
      />
      <div class="lupa-products" data-cy="lupa-products">
        <LoadingGrid
          :enabled="skeletonEnabled"
          :loading="loading"
          :count="limit ?? 12"
          :style="columnSize"
        >
          <template v-if="$slots.productCard">
            <slot
              v-for="(product, index) in searchResult.items"
              :key="getProductKeyAction(index, product)"
              name="productCard"
              :style="columnSize"
              :product="product"
              :options="productCardOptions"
            />
          </template>
          <template v-else>
            <SearchResultsProductCard
              v-for="(product, index) in searchResult.items"
              :key="getProductKeyAction(index, product)"
              :style="columnSize"
              :product="product"
              :options="productCardOptions"
              :analytics-metadata="clickMetadata"
            />
          </template>
        </LoadingGrid>
      </div>
      <div
        v-if="isPageEmpty && options.labels.noItemsInPage"
        class="lupa-empty-results"
        data-cy="lupa-no-results-in-page"
      >
        {{ options.labels.noItemsInPage }}
        <span
          v-if="options.labels.backToFirstPage"
          class="lupa-empty-page-action"
          @click="goToFirstPage"
        >
          {{ options.labels.backToFirstPage }}</span
        >
      </div>
      <SearchResultsToolbar
        class="lupa-toolbar-bottom"
        :options="options"
        pagination-location="bottom"
      />
      <AdditionalPanels :options="options" location="bottom" :sdk-options="options.options" />
    </template>
    <div
      v-else-if="!loading && currentQueryText"
      class="lupa-empty-results"
      data-cy="lupa-no-results"
    >
      <ZeroResults
        :empty-results-label="options.labels?.emptyResults"
        :current-query-text="currentQueryText"
        :has-similar-queries="hasSimilarQueries || hasSimilarResults"
        :zero-results="options?.zeroResults"
      />
    </div>
    <RefinersLoadingNotice :labels="options.labels" />
    <div v-if="hasSimilarQueries">
      <SearchResultsSimilarQueries
        :labels="similarQueriesLabels"
        :column-size="columnSize"
        :product-card-options="productCardOptions"
      />
    </div>
    <div v-if="hasSimilarResults">
      <SearchResultsSimilarResults
        :labels="similarResultsLabels"
        :column-size="columnSize"
        :product-card-options="productCardOptions"
      />
    </div>
    <slot name="append" />
  </div>
</template>
