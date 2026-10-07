import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import lupaSearchSdk from '@getlupa/client-sdk'
import type { PrecheckResult, PublicQuery, SearchQueryResult } from '@getlupa/client-sdk/Types'
import type { SdkOptions } from '@/types/General'
import type { SearchResultsSortOptions } from '@/types/search-results/SearchResultsSort'
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { isFacetKey } from '@/utils/filter.utils'
import { getPageUrl } from '@/utils/routing.utils'
import { areAiSearchFiltersApplied, getAiSearchFilterParams } from '@/utils/aiSearch.utils'
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

export const useAiSearchStore = defineStore('aiSearch', () => {
  const precheckAssisted = ref(false)
  const lastPrecheckRequestId = ref('')
  // Only known right after AI search ran. Results restored with `adj` from the URL have none
  const explanation = ref<string | undefined>(undefined)
  const explanationSearchText = ref<string | undefined>(undefined)

  // Best products (`bestProducts` and `clickToTrigger` modes): loaded once per search text
  const bestProductsRequest = ref<BestProductsRequest | null>(null)
  const bestProductsResult = ref<SearchQueryResult | null>(null)
  const bestProductsLoading = ref(false)
  // Search text set by applyBestProductsSuggestions: best products are kept for it
  const bestProductsAppliedSearchText = ref<string | undefined>(undefined)
  const bestProductsExpanded = ref(true)
  let bestProductsRequestCounter = 0
  const lastBestProductsRequestId = ref(0)

  const searchResultStore = useSearchResultStore()
  const paramsStore = useParamsStore()
  const optionsStore = useOptionsStore()
  const dynamicDataStore = useDynamicDataStore()

  const { loading } = storeToRefs(searchResultStore)

  const aiSearchLoading = computed(() => precheckAssisted.value && loading.value)

  const { adjustedSearchText, filters, query: searchText } = storeToRefs(paramsStore)

  /** AI search result is kept: `adj` is in the URL and there is at least one filter */
  const aiSearchActive = computed(() => {
    return (
      adjustedSearchText.value !== undefined &&
      Object.values(filters.value).some((filter) => hasFilterValue(filter))
    )
  })

  /** Explanation for the current search text, if AI search ran for it in this session */
  const currentExplanation = computed(() => {
    return explanationSearchText.value === searchText.value ? explanation.value : undefined
  })

  /** AI search metadata of the best products result, only when AI search was applied */
  const bestProductsAiSearch = computed(() => {
    const aiSearch = bestProductsResult.value?.executionMetadata?.aiSearch
    return aiSearch?.applied ? aiSearch : undefined
  })

  const bestProductsHasSuggestions = computed(() => {
    const aiSearch = bestProductsAiSearch.value
    return Boolean(Object.keys(aiSearch?.filters ?? {}).length || aiSearch?.sort?.length)
  })

  /**
   * Search text that applying suggestions sets. Undefined when it should not change: AI search
   * returned none, or it is empty while empty queries are not allowed
   */
  const bestProductsSuggestedSearchText = computed(() => {
    const aiSearchText = bestProductsAiSearch.value?.searchText
    if (aiSearchText === '' && optionsStore.searchResultOptions?.disallowEmptyQuery) {
      return undefined
    }
    return aiSearchText
  })

  /** True if suggested search text, filters and sort are already in the URL */
  const bestProductsSuggestionsApplied = computed(() => {
    const aiSearch = bestProductsAiSearch.value
    if (!aiSearch) {
      return false
    }
    const suggestedSearchText = bestProductsSuggestedSearchText.value
    const searchTextApplied =
      suggestedSearchText === undefined || (searchText.value ?? '') === suggestedSearchText
    const sortApplied =
      !aiSearch.sort?.length ||
      paramsStore.sort === getSortParamValue(optionsStore.searchResultOptions?.sort, aiSearch.sort)
    return (
      searchTextApplied && sortApplied && areAiSearchFiltersApplied(aiSearch.filters, filters.value)
    )
  })

  const resetPrecheck = () => {
    lastPrecheckRequestId.value = ''
    precheckAssisted.value = false
  }

  /**
   * Runs in parallel with the main search query, with the same body. Precheck is optional,
   * so errors only reset the state and are not passed to `onError`.
   */
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

  /**
   * When AI search was applied to a fresh search (no `adjustedSearchText` sent), stores its filters,
   * sort and adjusted search text in the URL. Following requests then keep the AI search result.
   */
  const applyAiSearchResult = ({
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
    const aiSearch = result.executionMetadata?.aiSearch
    if (!aiSearch?.applied) {
      explanation.value = undefined
      explanationSearchText.value = undefined
      return
    }
    explanation.value = aiSearch.explanation
    explanationSearchText.value = query.searchText
    const getQueryParamName = optionsStore.getQueryParamName
    const params = [
      { name: getQueryParamName(QUERY_PARAMS.ADJUSTED), value: aiSearch.searchText ?? '' },
      ...getAiSearchFilterParams(aiSearch.filters, paramsStore.filters)
    ]
    if (aiSearch.sort?.length) {
      params.push({
        name: getQueryParamName(QUERY_PARAMS.SORT),
        value: getSortParamValue(sortOptions, aiSearch.sort)
      })
    }
    paramsStore.replaceParams({ params })
  }

  /** Removes all filters and sort, keeps `adj`: the search then returns regular results */
  const clearAiSearch = (): void => {
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

  /**
   * Called with every main search. Best products are reset and prepared only when the search text
   * changes. `autoLoad` loads them right away, otherwise `loadBestProducts` loads them on demand.
   */
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

  /**
   * Adds suggested filters and sort to the current search as regular filters and sort, and changes
   * the search text to the one AI search ran with. Best products are kept for the new search text
   * and collapsed, so the updated results are visible.
   */
  const applyBestProductsSuggestions = (): void => {
    const aiSearch = bestProductsAiSearch.value
    if (!aiSearch) {
      return
    }
    const getQueryParamName = optionsStore.getQueryParamName
    const params = getAiSearchFilterParams(aiSearch.filters, filters.value)
    const suggestedSearchText = bestProductsSuggestedSearchText.value
    if (suggestedSearchText !== undefined) {
      bestProductsAppliedSearchText.value = suggestedSearchText
      params.unshift({ name: getQueryParamName(QUERY_PARAMS.QUERY), value: suggestedSearchText })
    }
    if (aiSearch.sort?.length) {
      params.push({
        name: getQueryParamName(QUERY_PARAMS.SORT),
        value: getSortParamValue(optionsStore.searchResultOptions?.sort, aiSearch.sort)
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
    bestProductsAiSearch,
    bestProductsSuggestedSearchText,
    bestProductsHasSuggestions,
    bestProductsSuggestionsApplied,
    prepareBestProducts,
    loadBestProducts,
    resetBestProducts,
    applyBestProductsSuggestions,
    precheckAssisted,
    aiSearchLoading,
    aiSearchActive,
    explanation,
    explanationSearchText,
    currentExplanation,
    clearAiSearch,
    precheck,
    resetPrecheck,
    applyAiSearchResult
  }
})
