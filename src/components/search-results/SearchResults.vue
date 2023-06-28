<script lang="ts" setup>
import lupaSearchSdk from '@getlupa/client-sdk'
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { useDynamicDataStore } from '@/stores/dynamicData'
import { useScreenStore } from '@/stores/screen'
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import { useTrackingStore } from '@/stores/tracking'
import type {
  SearchResultsDidYouMeanLabels,
  SearchResultsOptions
} from '@/types/search-results/SearchResultsOptions'
import { setDocumentTitle } from '@/utils/document.utils'
import { parseParams } from '@/utils/params.utils'
import { pick } from '@/utils/picker.utils'
import { createPublicQuery, getPublicQuery } from '@/utils/query.utils'
import type { FilterGroup, PublicQuery, SearchQueryResult } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getLupaTrackingContext } from '@/utils/tracking.utils'
import SearchResultsDidYouMean from './SearchResultsDidYouMean.vue'
import SearchResultsTitle from './SearchResultsTitle.vue'
import MobileFilterSidebar from './filters/MobileFilterSidebar.vue'
import SearchResultsBreadcrumbs from './SearchResultsBreadcrumbs.vue'
import SearchResultsFilters from './filters/SearchResultsFilters.vue'
import SearchResultsProducts from './products/SearchResultsProducts.vue'
import CategoryTopFilters from '../product-list/CategoryTopFilters.vue'

const props = defineProps<{
  options: SearchResultsOptions
  initialFilters?: FilterGroup
  isProductList?: boolean
  isContainer?: boolean
}>()

const searchResultStore = useSearchResultStore()
const optionStore = useOptionsStore()
const paramStore = useParamsStore()
const trackingStore = useTrackingStore()
const dynamicDataStore = useDynamicDataStore()
const screenStore = useScreenStore()

const initialFilters = computed(() => props.initialFilters ?? {})

const { currentQueryText, hasResults, currentFilterCount } = storeToRefs(searchResultStore)
const { searchString } = storeToRefs(paramStore)
const { defaultSearchResultPageSize } = storeToRefs(optionStore)

const searchResultsFilters = ref(null)

const didYouMeanLabels = computed((): SearchResultsDidYouMeanLabels => {
  return pick(props.options.labels, ['noResultsSuggestion', 'didYouMean'])
})

const showFilterSidebar = computed((): boolean => {
  return (
    props.options.filters?.facets?.style?.type === 'sidebar' &&
    (hasResults.value || currentFilterCount.value > 0)
  )
})

const isTitleResultTopPosition = computed((): boolean => {
  return props.options.searchTitlePosition === 'search-results-top'
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  optionStore.setSearchResultOptions({ options: props.options })
  handleMounted()
  optionStore.setInitialFilters({ initialFilters: initialFilters.value })
  props.options.callbacks?.onMounted?.()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const trackItemListView = (title: string, items: Record<string, unknown>[] = []): void => {
  trackingStore.trackEvent({
    queryKey: props.options.queryKey,
    data: {
      analytics: {
        type: 'view_item_list',
        label: title,
        listLabel: title,
        items
      },
      options: { allowEmptySearchQuery: true }
    }
  })
}

const handleResults = async ({
  queryKey,
  results
}: {
  queryKey: string
  results: SearchQueryResult
}): Promise<void> => {
  trackingStore.trackResults({ queryKey, results })
  const hasResults = Boolean(
    results.total > 0 || results.similarQueries?.length || results.didYouMean?.options
  )
  props.options.callbacks?.onSearchResults?.({ queryKey, hasResults })
  if (!hasResults) {
    return
  }
  trackItemListView(props.options.labels.htmlTitleTemplate, results.items)
  await dynamicDataStore.enhanceSearchResultsWithDynamicData({ result: results })
}

const query = (publicQuery: PublicQuery): void => {
  trackingStore.trackSearch({
    queryKey: props.options.queryKey,
    query: publicQuery,
    type: 'search_form_submit'
  })
  const context = getLupaTrackingContext()
  const limit = publicQuery.limit || defaultSearchResultPageSize.value
  const query = { ...publicQuery, ...context, limit }
  if (!query.searchText && props.options.disallowEmptyQuery) {
    return
  }
  lupaSearchSdk
    .query(props.options.queryKey, query, props.options.options)
    .then((res) => {
      if (res.success) {
        handleResults({ queryKey: props.options.queryKey, results: res })
        searchResultStore.add({ ...res })
      } else if (props.options?.options?.onError) {
        props.options.options.onError(res)
      }
    })
    .catch((err) => {
      console.error(err)
      if (props.options?.options?.onError) {
        props.options.options.onError(err)
      }
    })
    .finally(() => {
      searchResultStore.setLoading(false)
    })
}

const handleResize = (): void => {
  const doc = document.documentElement
  doc.style.setProperty('--lupa-full-height', `${window.innerHeight}px`)
  searchResultStore.setColumnCount({ width: window.innerWidth, grid: props.options.grid })
  screenStore.setScreenWidth({ width: window.innerWidth })
}

const handleUrlChange = (params?: URLSearchParams): void => {
  const searchParams = params || new URLSearchParams(window.location.search)
  const publicQuery = createPublicQuery(
    parseParams(searchParams),
    props.options.sort,
    defaultSearchResultPageSize.value
  )
  searchResultStore.setLoading(true)
  query(getPublicQuery(publicQuery, initialFilters.value, props.isProductList))
}

const handleMounted = (): void => {
  handleResize()
  if (props.isProductList) {
    const pageTitle = props.options.labels.htmlTitleTemplate
    setDocumentTitle(pageTitle, '')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (searchResultsFilters.value) {
      ;(searchResultsFilters.value as any)?.fetch()
    }
  }
  const params = new URLSearchParams(window.location.search)
  if (!params.has(QUERY_PARAMS.QUERY)) {
    handleUrlChange(params)
  }
  paramStore.add(parseParams(params))
  paramStore.setDefaultLimit(defaultSearchResultPageSize.value)
}

watch(searchString, () => handleParamsChange())

const handleParamsChange = (): void => {
  handleUrlChange()
  props.options.callbacks?.onUrlQueryChange?.({
    queryKey: props.options.queryKey,
    urlQueryString: searchString.value
  })
}
</script>
<template>
  <div
    class="lupa-search-result-wrapper"
    :class="{ 'lupa-search-wrapper-no-results': !hasResults }"
  >
    <template v-if="isContainer">
      <div class="lupa-container-title-summary-mobile">
        <SearchResultsDidYouMean :labels="didYouMeanLabels" />
        <SearchResultsTitle
          :show-summary="true"
          :options="options"
          :is-product-list="isProductList ?? false"
        />
      </div>
    </template>
    <CategoryTopFilters v-if="isTitleResultTopPosition" :options="options" />
    <MobileFilterSidebar v-if="options.filters" :options="options.filters" />
    <SearchResultsBreadcrumbs
      v-if="currentQueryText || isProductList"
      :breadcrumbs="options.breadcrumbs"
    />
    <template v-if="isTitleResultTopPosition">
      <div id="lupa-search-results" class="top-layout-wrapper">
        <SearchResultsFilters
          v-if="showFilterSidebar"
          :options="options.filters ?? {}"
          ref="searchResultsFilters"
        />
        <div class="search-content">
          <SearchResultsDidYouMean :labels="didYouMeanLabels" />
          <SearchResultsTitle :options="options" :is-product-list="isProductList ?? false" />

          <SearchResultsProducts :options="options">
            <template #append>
              <slot />
            </template>
          </SearchResultsProducts>
        </div>
      </div>
    </template>
    <template v-else>
      <SearchResultsDidYouMean :labels="didYouMeanLabels" />
      <SearchResultsTitle :options="options" :is-product-list="isProductList ?? false" />

      <div id="lupa-search-results">
        <SearchResultsFilters
          v-if="showFilterSidebar"
          :options="options.filters ?? {}"
          ref="searchResultsFilters"
        />
        <SearchResultsProducts :options="options">
          <template #append>
            <slot />
          </template>
        </SearchResultsProducts>
      </div>
    </template>
  </div>
</template>
