import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import lupaSearchSdk from '@getlupa/client-sdk'
import type { PrecheckResult, PublicQuery, SearchQueryResult } from '@getlupa/client-sdk/Types'
import type { SdkOptions } from '@/types/General'
import type { SearchResultsSortOptions } from '@/types/search-results/SearchResultsSort'
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { isFacetKey } from '@/utils/filter.utils'
import { getPageUrl } from '@/utils/routing.utils'
import { getAiSearchFilterParams } from '@/utils/aiSearch.utils'
import { getSortParamValue } from '@/utils/sort.utils'
import { useSearchResultStore } from './searchResult'
import { useParamsStore } from './params'
import { useOptionsStore } from './options'

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

  const searchResultStore = useSearchResultStore()
  const paramsStore = useParamsStore()
  const optionsStore = useOptionsStore()

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

  return {
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
