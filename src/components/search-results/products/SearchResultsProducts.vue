<script lang="ts" setup>
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import { ResultsLayoutEnum } from '@/types/search-results/ResultsLayout'
import type {
  ResultCurrentFilterOptions,
  SearchResultsProductOptions,
  SearchResultsSimilarQueriesLabels,
  SearchResultsSimilarResultsLabels
} from '@/types/search-results/SearchResultsOptions'
import type { Document } from '@getlupa/client-sdk/Types'
import type { SearchResultsProductCardOptions } from '@/types/search-results/SearchResultsProductCardOptions'
import { pick } from '@/utils/picker.utils'
import { getProductKey } from '@/utils/string.utils'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
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

const props = defineProps<{
  options: SearchResultsProductOptions
  ssr?: boolean
}>()

const searchResultStore = useSearchResultStore()
const paramStore = useParamsStore()
const optionStore = useOptionsStore()

const {
  hasResults,
  currentQueryText,
  isPageEmpty,
  isMobileSidebarVisible,
  columnCount,
  searchResult,
  layout,
  loading
} = storeToRefs(searchResultStore)

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
  return props.options.filters?.facets?.style?.type === 'top-dropdown'
})

const showMobileFilters = computed((): boolean => {
  return props.options.searchTitlePosition !== 'search-results-top'
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

const columnSize = computed((): string => {
  // Programic grid disabled when ssr is on
  if (props.ssr) {
    return ''
  }
  if (layout.value === ResultsLayoutEnum.LIST) {
    return 'width: 100%'
  }
  return `width: ${100 / columnCount.value}%`
})

const hasSimilarQueries = computed(() => Boolean(searchResult.value.similarQueries?.length))

const hasSimilarResults = computed(() => Boolean(searchResult.value.similarResults?.items?.length))

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
    <Spinner class="lupa-loader" v-if="loading && !isMobileSidebarVisible" />
    <RedirectionSuggestions :options="options.redirectionSuggestions" />
    <AdditionalPanels :options="options" location="top" :sdkOptions="options.options" />
    <RelatedQueries v-if="options.relatedQueries" :options="options.relatedQueries" />
    <template v-if="hasResults">
      <FiltersTopDropdown v-if="showTopFilters" :options="options.filters ?? {}" />
      <SearchResultsToolbar
        class="lupa-toolbar-mobile"
        v-if="showMobileFilters"
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
        <template v-if="$slots.productCard">
          <slot
            name="productCard"
            v-for="(product, index) in searchResult.items"
            :style="columnSize"
            :key="getProductKeyAction(index, product)"
            :product="product"
            :options="productCardOptions"
          />
        </template>
        <template v-else>
          <SearchResultsProductCard
            v-for="(product, index) in searchResult.items"
            :style="columnSize"
            :key="getProductKeyAction(index, product)"
            :product="product"
            :options="productCardOptions"
          />
        </template>
      </div>
      <div
        class="lupa-empty-results"
        data-cy="lupa-no-results-in-page"
        v-if="isPageEmpty && options.labels.noItemsInPage"
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
      <AdditionalPanels :options="options" location="bottom" :sdkOptions="options.options" />
    </template>
    <div
      class="lupa-empty-results"
      data-cy="lupa-no-results"
      v-else-if="!loading && currentQueryText"
    >
      {{ options.labels.emptyResults }} <span>{{ currentQueryText }}</span>
    </div>

    <div v-if="hasSimilarQueries">
      <SearchResultsSimilarQueries
        :labels="similarQueriesLabels"
        :columnSize="columnSize"
        :productCardOptions="productCardOptions"
      />
    </div>
    <div v-if="hasSimilarResults">
      <SearchResultsSimilarResults
        :labels="similarResultsLabels"
        :columnSize="columnSize"
        :productCardOptions="productCardOptions"
      />
    </div>
    <slot name="append" />
  </div>
</template>
