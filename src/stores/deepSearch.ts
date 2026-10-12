import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import lupaSearchSdk from '@getlupa/client-sdk'
import type { PrecheckResult, PublicQuery, SearchQueryResult } from '@getlupa/client-sdk/Types'
import type { SdkOptions } from '@/types/General'
import type { SearchResultsSortOptions } from '@/types/search-results/SearchResultsSort'
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { isFacetKey } from '@/utils/filter.utils'
import { getPageUrl } from '@/utils/routing.utils'
import { areDeepSearchFiltersApplied, getDeepSearchFilterParams } from '@/utils/deepSearch.utils'
import { getSortParamValue } from '@/utils/sort.utils'
import { useSearchResultStore } from './searchResult'
import { useParamsStore } from './params'
import { useOptionsStore } from './options'
import { useDynamicDataStore } from './dynamicData'

type BestProductsRequest = {
  queryKey: string
  query: PublicQuery
  options?: SdkOptions
}

const hasFilterValue = (filter: unknown): boolean => {
  if (Array.isArray(filter)) {
    return filter.length > 0
  }
  if (filter && typeof filter === 'object') {
    const hierarchyTerms = (filter as { terms?: unknown[] }).terms
    return Array.isArray(hierarchyTerms)
      ? hierarchyTerms.length > 0
      : Object.values(filter).some((v) => v !== undefined && v !== '')
  }
  return false
}

export const useDeepSearchStore = defineStore('deepSearch', () => {
  const precheckAssisted = ref(false)
  const lastPrecheckRequestId = ref('')
  const explanation = ref<string | undefined>(undefined)
  const explanationSearchText = ref<string | undefined>(undefined)

  const bestProductsRequest = ref<BestProductsRequest | null>(null)
  const bestProductsResult = ref<SearchQueryResult | null>(null)
  const bestProductsLoading = ref(false)
  const bestProductsAppliedSearchText = ref<string | undefined>(undefined)
  const bestProductsExpanded = ref(true)
  let bestProductsRequestCounter = 0
  const lastBestProductsRequestId = ref(0)

  const searchResultStore = useSearchResultStore()
  const paramsStore = useParamsStore()
  const optionsStore = useOptionsStore()
  const dynamicDataStore = useDynamicDataStore()

  const { loading } = storeToRefs(searchResultStore)

  const deepSearchLoading = computed(() => precheckAssisted.value && loading.value)

  const { adjustedSearchText, filters, query: searchText } = storeToRefs(paramsStore)

  const deepSearchActive = computed(() => {
    return (
      adjustedSearchText.value !== undefined &&
      Object.values(filters.value).some((filter) => hasFilterValue(filter))
    )
  })

  const currentExplanation = computed(() => {
    return explanationSearchText.value === searchText.value ? explanation.value : undefined
  })

  const bestProductsDeepSearch = computed(() => {
    const deepSearch = bestProductsResult.value?.executionMetadata?.deepSearch
    return deepSearch?.applied ? deepSearch : undefined
  })

  const bestProductsHasSuggestions = computed(() => {
    const deepSearch = bestProductsDeepSearch.value
    return Boolean(Object.keys(deepSearch?.filters ?? {}).length || deepSearch?.sort?.length)
  })

  const bestProductsSuggestedSearchText = computed(() => {
    const deepSearchText = bestProductsDeepSearch.value?.searchText
    if (deepSearchText === '' && optionsStore.searchResultOptions?.disallowEmptyQuery) {
      return undefined
    }
    return deepSearchText
  })

  const bestProductsSuggestionsApplied = computed(() => {
    const deepSearch = bestProductsDeepSearch.value
    if (!deepSearch) {
      return false
    }
    const suggestedSearchText = bestProductsSuggestedSearchText.value
    const searchTextApplied =
      suggestedSearchText === undefined || (searchText.value ?? '') === suggestedSearchText
    const sortApplied =
      !deepSearch.sort?.length ||
      paramsStore.sort ===
        getSortParamValue(optionsStore.searchResultOptions?.sort, deepSearch.sort)
    return (
      searchTextApplied &&
      sortApplied &&
      areDeepSearchFiltersApplied(deepSearch.filters, filters.value)
    )
  })

  const resetPrecheck = () => {
    lastPrecheckRequestId.value = ''
    precheckAssisted.value = false
  }

  /** Precheck is optional, so its errors are not passed to `onError` */
  const precheck = async ({
    requestId,
    queryKey,
    query,
    options
  }: {
    requestId: string
    queryKey: string
    query: PublicQuery
    options?: SdkOptions
  }): Promise<void> => {
    lastPrecheckRequestId.value = requestId
    precheckAssisted.value = false
    if (!query.searchText || query.adjustedSearchText !== undefined) {
      return
    }
    try {
      const res = await lupaSearchSdk.queryPrecheck(queryKey, query, options)
      if (lastPrecheckRequestId.value !== requestId || !res.success) {
        return
      }
      precheckAssisted.value = Boolean((res as PrecheckResult).assisted)
    } catch (err) {
      console.error(err)
    }
  }

  /** Following requests send `adj` from the URL, so they keep the deep search result */
  const saveDeepSearchResultToUrl = ({
    query,
    result,
    sortOptions
  }: {
    query: PublicQuery
    result: SearchQueryResult
    sortOptions?: SearchResultsSortOptions[]
  }): void => {
    if (query.adjustedSearchText !== undefined) {
      return
    }
    const deepSearch = result.executionMetadata?.deepSearch
    if (!deepSearch?.applied) {
      explanation.value = undefined
      explanationSearchText.value = undefined
      return
    }
    explanation.value = deepSearch.explanation
    explanationSearchText.value = query.searchText
    const getQueryParamName = optionsStore.getQueryParamName
    const params = [
      { name: getQueryParamName(QUERY_PARAMS.ADJUSTED), value: deepSearch.searchText ?? '' },
      ...getDeepSearchFilterParams(deepSearch.filters, paramsStore.filters)
    ]
    if (deepSearch.sort?.length) {
      params.push({
        name: getQueryParamName(QUERY_PARAMS.SORT),
        value: getSortParamValue(sortOptions, deepSearch.sort)
      })
    }
    paramsStore.replaceParams({ params })
  }

  /** Keeps `adj`, so deep search does not run again */
  const clearDeepSearch = (): void => {
    const getQueryParamName = optionsStore.getQueryParamName
    const facetParams = Array.from(getPageUrl().searchParams.keys()).filter(isFacetKey)
    paramsStore.removeParameters({
      paramsToRemove: [
        ...facetParams,
        getQueryParamName(QUERY_PARAMS.SORT),
        getQueryParamName(QUERY_PARAMS.PAGE)
      ]
    })
  }

  const resetBestProducts = (): void => {
    lastBestProductsRequestId.value = 0
    bestProductsRequest.value = null
    bestProductsResult.value = null
    bestProductsLoading.value = false
    bestProductsAppliedSearchText.value = undefined
    bestProductsExpanded.value = true
  }

  const toggleBestProductsExpanded = (expanded = !bestProductsExpanded.value): void => {
    bestProductsExpanded.value = expanded
  }

  const loadBestProducts = async (): Promise<void> => {
    const request = bestProductsRequest.value
    if (!request || bestProductsLoading.value || bestProductsResult.value) {
      return
    }
    const requestId = ++bestProductsRequestCounter
    lastBestProductsRequestId.value = requestId
    bestProductsLoading.value = true
    try {
      const res = await lupaSearchSdk.query(request.queryKey, request.query, request.options)
      if (lastBestProductsRequestId.value !== requestId) {
        return
      }
      if (!res.success) {
        request.options?.onError?.(res)
        return
      }
      bestProductsResult.value = res as SearchQueryResult
      dynamicDataStore.enhanceSearchResultsWithDynamicData({ result: res as SearchQueryResult })
    } catch (err) {
      console.error(err)
      request.options?.onError?.(err)
    } finally {
      if (lastBestProductsRequestId.value === requestId) {
        bestProductsLoading.value = false
      }
    }
  }

  const prepareBestProducts = ({
    autoLoad,
    ...request
  }: BestProductsRequest & { autoLoad: boolean }): void => {
    const current = bestProductsRequest.value
    const requestSearchText = request.query.searchText ?? ''
    if (
      current?.queryKey === request.queryKey &&
      (current.query.searchText === requestSearchText ||
        bestProductsAppliedSearchText.value === requestSearchText)
    ) {
      return
    }
    if (!requestSearchText) {
      resetBestProducts()
      return
    }
    resetBestProducts()
    bestProductsRequest.value = request
    if (autoLoad) {
      loadBestProducts()
    }
  }

  /** Best products are kept for the suggested search text and collapsed, so updated results are visible */
  const applyBestProductsSuggestions = (): void => {
    const deepSearch = bestProductsDeepSearch.value
    if (!deepSearch) {
      return
    }
    const getQueryParamName = optionsStore.getQueryParamName
    const params = getDeepSearchFilterParams(deepSearch.filters, filters.value)
    const suggestedSearchText = bestProductsSuggestedSearchText.value
    if (suggestedSearchText !== undefined) {
      bestProductsAppliedSearchText.value = suggestedSearchText
      params.unshift({ name: getQueryParamName(QUERY_PARAMS.QUERY), value: suggestedSearchText })
    }
    if (deepSearch.sort?.length) {
      params.push({
        name: getQueryParamName(QUERY_PARAMS.SORT),
        value: getSortParamValue(optionsStore.searchResultOptions?.sort, deepSearch.sort)
      })
    }
    bestProductsExpanded.value = false
    paramsStore.appendParams({
      params: params as { name: string; value: string }[],
      paramsToRemove: [getQueryParamName(QUERY_PARAMS.PAGE)]
    })
  }

  return {
    bestProductsRequest,
    bestProductsResult,
    bestProductsLoading,
    bestProductsAppliedSearchText,
    bestProductsExpanded,
    toggleBestProductsExpanded,
    bestProductsDeepSearch,
    bestProductsSuggestedSearchText,
    bestProductsHasSuggestions,
    bestProductsSuggestionsApplied,
    prepareBestProducts,
    loadBestProducts,
    resetBestProducts,
    applyBestProductsSuggestions,
    precheckAssisted,
    deepSearchLoading,
    deepSearchActive,
    explanation,
    explanationSearchText,
    currentExplanation,
    clearDeepSearch,
    precheck,
    resetPrecheck,
    saveDeepSearchResultToUrl
  }
})
