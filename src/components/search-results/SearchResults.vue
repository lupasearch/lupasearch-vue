<script lang="ts" setup>
import lupaSearchSdk from '@getlupa/client-sdk'
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { useDynamicDataStore } from '@/stores/dynamicData'
import { useScreenStore } from '@/stores/screen'
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import { useTrackingStore } from '@/stores/tracking'
import { useRedirectionStore } from '@/stores/redirections'
import type {
  SearchResultsDidYouMeanLabels,
  SearchResultsOptions
} from '@/types/search-results/SearchResultsOptions'
import { setDocumentTitle } from '@/utils/document.utils'
import { parseParams } from '@/utils/params.utils'
import { pick } from '@/utils/picker.utils'
import { createPublicQuery, getPublicQuery } from '@/utils/query.utils'
import { getSearchParams } from '@/utils/ssr.utils'
import type {
  FilterGroup,
  PublicQuery,
  SdkError,
  SearchQueryResult
} from '@getlupa/client-sdk/Types'
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
import { processExtractionObject } from '@/utils/extraction.utils'
import { ResultsLayoutEnum } from '@/types/search-results/ResultsLayout'

const props = defineProps<{
  options: SearchResultsOptions
  initialFilters?: FilterGroup
  isProductList?: boolean
  isContainer?: boolean
  initialData?: SearchQueryResult
}>()

const searchResultStore = useSearchResultStore()
const optionStore = useOptionsStore()
const paramStore = useParamsStore()
const trackingStore = useTrackingStore()
const dynamicDataStore = useDynamicDataStore()
const screenStore = useScreenStore()
const redirectionStore = useRedirectionStore()

const extractedInitialFilters = computed(() => {
  return {
    ...processExtractionObject(props.options.initialFilters)
  }
})

const initialFilters = computed(() => props.initialFilters ?? extractedInitialFilters.value ?? {})

const {
  currentQueryText,
  hasResults,
  currentFilterCount,
  isMobileSidebarVisible,
  layout,
  loadingFacets,
  loadingRefiners
} = storeToRefs(searchResultStore)
const { searchString, sortParams, skipFacetReload } = storeToRefs(paramStore)
const { defaultSearchResultPageSize } = storeToRefs(optionStore)

const searchResultsFilters = ref(null)

const mounted = ref(false)

const ssrEnabled = computed(() => Boolean(props.options.ssr))

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

const indicatorClasses = computed(() => {
  return {
    'lupa-mobile-sidebar-visible': isMobileSidebarVisible.value,
    'lupa-layout-grid': !layout.value || layout.value === ResultsLayoutEnum.GRID,
    'lupa-layout-list': layout.value === ResultsLayoutEnum.LIST
  }
})

// Code for handling browser back button navigation
const handlePopState = () => {
  const searchParams = getSearchParams(props.options.ssr?.url)
  paramStore.add(parseParams(optionStore.getQueryParamName, searchParams))
}

onMounted(async () => {
  window.addEventListener('popstate', handlePopState)
  window.addEventListener('resize', handleResize)
  await redirectionStore.initiate(props.options.redirections, props.options.options)
  if (props.initialData) {
    searchResultStore.add('', { ...props.initialData })
  }
  handleMounted()
  props.options.callbacks?.onMounted?.()
  mounted.value = true
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('popstate', handlePopState)
})

const trackItemListView = (title: string, items: Record<string, unknown>[] = []): void => {
  trackingStore.trackEvent({
    queryKey: props.options.queryKey,
    data: {
      analytics: {
        type: 'view_item_list',
        label: title,
        listLabel: title,
        items,
        additionalParams: {
          previousSortKey: sortParams.value?.previousSortKey,
          newSortKey: sortParams.value?.selectedSortKey
        }
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
    results.total > 0 ||
      results.similarQueries?.length ||
      results.didYouMean?.options ||
      results.similarResults?.items?.length
  )
  props.options.callbacks?.onSearchResults?.({ queryKey, hasResults, params: paramStore.params })
  if (!hasResults) {
    return
  }
  trackItemListView(props.options.labels.htmlTitleTemplate, results.items)
  await dynamicDataStore.enhanceSearchResultsWithDynamicData({ result: results })
}

const query = (requestId: string, publicQuery: PublicQuery): void => {
  trackingStore.trackSearch({
    queryKey: props.options.queryKey,
    query: publicQuery,
    type: 'search_form_submit'
  })
  const context = getLupaTrackingContext()
  const limit = publicQuery.limit || defaultSearchResultPageSize.value
  const modifiers = props.options.splitExpensiveRequests
    ? { facets: false, refiners: false }
    : undefined
  const query = { ...publicQuery, ...context, limit, modifiers }

  const redirectionApplied = redirectionStore.redirectOnKeywordIfConfigured(
    publicQuery.searchText,
    optionStore.searchResultsRoutingBehavior
  )

  if (redirectionApplied) {
    return
  }

  if (!query.searchText && props.options.disallowEmptyQuery) {
    return
  }
  lupaSearchSdk
    .query(props.options.queryKey, query, props.options.options)
    .then((res) => {
      if (res.success) {
        handleResults({ queryKey: props.options.queryKey, results: res })
        searchResultStore.add(requestId, { ...res })
        searchResultStore.setRelatedQueriesApiEnabled(res.hasRelatedQueries ?? false)
        if (res.hasRelatedQueries) {
          searchResultStore.queryRelatedQueries(
            props.options.queryKey,
            publicQuery,
            res,
            props.options.options
          )
        }
        if (props.options.splitExpensiveRequests && res.refinementThreshold >= res.total) {
          queryRefiners(requestId, publicQuery)
        }
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

const queryFacets = (requestId: string, publicQuery: PublicQuery): void => {
  if (skipFacetReload.value) {
    return
  }
  loadingFacets.value = true
  const context = getLupaTrackingContext()
  const query = { ...publicQuery, ...context, modifiers: { facets: true, refiners: false } }
  lupaSearchSdk
    .queryFacets(props.options.queryKey, query, props.options.options)
    .then((res) => {
      if (!(res as SdkError).success) {
        return
      }
      searchResultStore.addPartial(requestId, { ...(res as Partial<SearchQueryResult>) })
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      loadingFacets.value = false
    })
}

const queryRefiners = (requestId: string, publicQuery: PublicQuery): void => {
  if (!publicQuery.searchText) {
    return
  }
  loadingRefiners.value = true
  const context = getLupaTrackingContext()
  const query = { ...publicQuery, ...context, modifiers: { facets: false, refiners: true } }
  lupaSearchSdk
    .queryRefiners(props.options.queryKey, query, props.options.options)
    .then((res) => {
      if (!(res as SdkError).success) {
        return
      }
      searchResultStore.addPartial(requestId, { ...(res as Partial<SearchQueryResult>) })
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      loadingRefiners.value = false
    })
}

const handleResize = (): void => {
  const doc = document.documentElement
  doc.style.setProperty('--lupa-full-height', `${window.innerHeight}px`)
  screenStore.setScreenWidth({ width: window.innerWidth })
  searchResultStore.setColumnCount({ width: window.innerWidth, grid: props.options.grid })
}

const handleUrlChange = (params?: URLSearchParams): void => {
  const requestId = new Date().getTime().toString()
  searchResultStore.setLastRequestId(requestId)
  const searchParams = getSearchParams(props.options.ssr?.url, params)
  const publicQuery = createPublicQuery(
    parseParams(optionStore.getQueryParamName, searchParams),
    props.options.sort,
    defaultSearchResultPageSize.value
  )
  searchResultStore.setLoading(true)
  const finalPublicQuery = getPublicQuery(publicQuery, initialFilters.value, props.isProductList)
  query(requestId, finalPublicQuery)
  if (props.options.splitExpensiveRequests) {
    queryFacets(requestId, finalPublicQuery)
  }
}

const handleMounted = (): void => {
  optionStore.setSearchResultOptions({ options: props.options })
  optionStore.setInitialFilters({ initialFilters: initialFilters.value })

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
  if (!params.has(optionStore.getQueryParamName(QUERY_PARAMS.QUERY)) && !props.initialData) {
    handleUrlChange(params)
  }
  paramStore.add(parseParams(optionStore.getQueryParamName, params))
  paramStore.setDefaultLimit(defaultSearchResultPageSize.value)
}

watch(searchString, () => handleParamsChange())

const handleParamsChange = (): void => {
  // Skip first change detection if there are query params on ssr
  if (props.initialData && !mounted.value) {
    return
  }
  handleUrlChange()
  props.options.callbacks?.onUrlQueryChange?.({
    queryKey: props.options.queryKey,
    urlQueryString: searchString.value
  })
}

const handleCreated = () => {
  const initialData = props.initialData
  if (initialData) {
    if (typeof window !== 'undefined') {
      optionStore.setSearchResultOptions({ options: props.options })
      if (props.initialData) {
        searchResultStore.add('', { ...props.initialData })
      }
      handleMounted()
      return
    }
    const searchParams = getSearchParams(
      props.options.ssr?.url,
      undefined,
      props.options.ssr?.baseUrl
    )
    optionStore.setSearchResultOptions({ options: props.options })
    searchResultStore.add('', { ...initialData })
    paramStore.add(parseParams(optionStore.getQueryParamName, searchParams), props.options.ssr)
    paramStore.setDefaultLimit(defaultSearchResultPageSize.value)
    handleResults({ queryKey: props.options.queryKey, results: initialData })
  }
}

handleCreated()

defineExpose({ handleMounted, handleUrlChange })
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
    <MobileFilterSidebar
      v-if="options.filters"
      :options="options.filters"
      @filter="handleParamsChange"
    />
    <SearchResultsBreadcrumbs
      v-if="currentQueryText || isProductList"
      :breadcrumbs="options.breadcrumbs"
    />
    <template v-if="isTitleResultTopPosition">
      <div id="lupa-search-results" class="top-layout-wrapper" :class="indicatorClasses">
        <SearchResultsFilters
          v-if="showFilterSidebar"
          :options="options.filters ?? {}"
          ref="searchResultsFilters"
          @filter="handleParamsChange"
        />
        <div class="search-content">
          <SearchResultsDidYouMean :labels="didYouMeanLabels" />
          <SearchResultsTitle :options="options" :is-product-list="isProductList ?? false" />
          <SearchResultsProducts :options="options" :ssr="ssrEnabled" @filter="handleParamsChange">
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

      <div id="lupa-search-results" :class="indicatorClasses">
        <SearchResultsFilters
          v-if="showFilterSidebar"
          :options="options.filters ?? {}"
          ref="searchResultsFilters"
          @filter="handleParamsChange"
        />
        <SearchResultsProducts :options="options" :ssr="ssrEnabled" @filter="handleParamsChange">
          <template #append>
            <slot />
          </template>
          <template v-if="$slots.productCard" #productCard="props">
            <slot name="productCard" v-bind="props" />
          </template>
        </SearchResultsProducts>
      </div>
    </template>
  </div>
</template>
