import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, type Ref } from 'vue'
import lupaSearchSdk from '@getlupa/client-sdk'
import type {
  FacetGroup,
  FacetGroupItem,
  PublicQuery,
  RelatedQueries,
  SdkError,
  SearchQueryResult
} from '@getlupa/client-sdk/Types'
import { ResultsLayoutEnum, type ResultsLayout } from '@/types/search-results/ResultsLayout'
import { getLabeledFilters, unfoldFilters } from '@/utils/filter.utils'
import { useOptionsStore } from './options'
import { useParamsStore } from './params'
import { disableBodyScroll, enableBodyScroll } from '@/utils/scroll.utils'
import { setDocumentTitle } from '@/utils/document.utils'
import type { ProductGrid } from '@/types/search-results/SearchResultsOptions'
import { useScreenStore } from './screen'
import { getNormalizedString } from '@/utils/string.utils'
import { getLupaTrackingContext } from '@/utils/tracking.utils'
import { SdkOptions } from '@/types/General'

export const useSearchResultStore = defineStore('searchResult', () => {
  const searchResult: Ref<SearchQueryResult> = ref({} as SearchQueryResult)
  const columnCount = ref(2)
  const addToCartAmount = ref(1)
  const layout = ref(ResultsLayoutEnum.GRID)
  const loading = ref(false)
  const loadingFacets = ref(false)
  const loadingRefiners = ref(false)
  const loadingRelatedQueries = ref(false)
  const isMobileSidebarVisible = ref(false)
  const relatedCategoryChildren = ref([])
  const lastRequestId = ref('')
  const searchRequestResults = ref<Record<string, Partial<SearchQueryResult>>>({})
  const relatedQueriesResult: Ref<Partial<RelatedQueries>> = ref({})
  const relatedQueriesApiEnabled: Ref<boolean | null> = ref(null)
  const lastResultsSource: Ref<string | undefined> = ref(undefined)

  const optionsStore = useOptionsStore()
  const paramsStore = useParamsStore()
  const screenStore = useScreenStore()

  const { searchResultOptions, multiCurrency } = storeToRefs(optionsStore)

  const facets = computed(() => searchResult.value.facets)

  const filters = computed(() => searchResult.value.filters)

  const currentQueryText = computed(() => searchResult.value.searchText)

  const totalItems = computed(() => searchResult.value.total)

  const hasResults = computed(() => totalItems.value > 0 || loading.value)

  const priceKeys = computed((): string[] => {
    return searchResultOptions.value?.priceKeys ?? []
  })

  const currency = computed((): string => {
    return searchResultOptions.value?.labels?.currency ?? ''
  })

  const priceSeparator = computed((): string => {
    return searchResultOptions.value?.labels?.priceSeparator ?? ''
  })

  const currencyTemplate = computed((): string => {
    return searchResultOptions.value?.labels?.currencyTemplate ?? ''
  })

  const filterTranslations = computed(() => {
    return searchResultOptions.value?.filters?.translations ?? {}
  })

  const labeledFilters = computed(() =>
    getLabeledFilters(
      unfoldFilters(filters.value, {
        keys: priceKeys.value,
        currency: currency.value,
        separator: priceSeparator.value,
        currencyTemplate: currencyTemplate.value,
        multiCurrency: multiCurrency.value
      }),
      facets.value,
      filterTranslations.value
    )
  )

  const displayFilters = computed(() => {
    const initialFilters = optionsStore.initialFilters
    return labeledFilters.value?.filter((f) => !initialFilters?.[f.key]) ?? []
  })

  const currentFilterCount = computed(() => displayFilters.value?.length ?? 0)

  const currentFilterKeys = computed(() => Object.keys(filters.value ?? {}))

  const hasAnyFilter = computed(() => Object.keys(filters.value ?? {}).length > 0)

  const hideFiltersOnExactMatchForKeys = computed(() => {
    return searchResultOptions.value?.filters?.facets?.hideFiltersOnExactMatchForKeys ?? []
  })

  const itemRange = computed(() => {
    const limit = paramsStore.limit ?? 0
    const offset = searchResult.value.offset ?? 0
    return [offset + 1, Math.min(offset + limit, totalItems.value)]
  })

  const isPageEmpty = computed(
    () => hasResults.value && (searchResult.value.offset ?? 0) >= totalItems.value
  )

  const setSidebarState = ({
    visible,
    disableBodyScrolling = true
  }: {
    visible: boolean
    disableBodyScrolling?: boolean
  }) => {
    if (visible && disableBodyScrolling) {
      disableBodyScroll()
    } else {
      enableBodyScroll()
    }
    isMobileSidebarVisible.value = visible
  }

  const queryFacet = async ({ queryKey, facetKey }: { queryKey: string; facetKey: string }) => {
    const query = { searchText: '', filters: { ...filters.value } }
    const options = optionsStore.envOptions ?? { environment: 'production' }
    const result = await lupaSearchSdk.query(queryKey, query, options)
    if (!result.success) {
      return
    }
    const facet = result.facets?.find((f) => f.key === facetKey)
    const facetItems = (facet as FacetGroup)?.items ?? []
    const updatedResult = {
      ...searchResult.value,
      facets: facets.value?.map((f) => (f.key === facetKey ? { ...f, items: facetItems } : f))
    }
    searchResult.value = updatedResult
  }

  const saveRequestResult = (
    requestId: string,
    result: Partial<SearchQueryResult>,
    source = 'items'
  ) => {
    const existingResult = searchRequestResults.value[requestId] ?? {}
    const combinedResult = { ...existingResult, ...result }
    searchRequestResults.value = {
      ...searchRequestResults.value,
      [requestId]: combinedResult
    }
    lastResultsSource.value = source
    searchResult.value = combinedResult as SearchQueryResult
  }

  const setLastRequestId = (requestId: string) => {
    lastRequestId.value = requestId
  }

  const add = (requestId: string, newSearchResult: SearchQueryResult) => {
    if (lastRequestId.value !== requestId || !newSearchResult) {
      return {
        searchResult: searchResult.value,
        pageSize: searchResult.value.limit || 0
      }
    }
    if (typeof document !== 'undefined') {
      setDocumentTitle(
        optionsStore.searchResultOptions?.labels?.htmlTitleTemplate,
        newSearchResult.searchText
      )
    }
    if (searchResultOptions.value.splitExpensiveRequests) {
      // Keep facets from old request for smooth filtering experience
      const combinedNewSearchResult = { facets: searchResult.value.facets, ...newSearchResult }
      saveRequestResult(requestId, combinedNewSearchResult)
    } else {
      saveRequestResult(requestId, newSearchResult)
    }
    return { searchResult: newSearchResult }
  }

  const addPartial = (
    requestId: string,
    newSearchResult: Partial<SearchQueryResult>,
    source: string
  ) => {
    if (lastRequestId.value !== requestId || !newSearchResult) {
      return
    }
    saveRequestResult(requestId, newSearchResult, source)
    return { searchResult: searchResult.value }
  }

  const setColumnCount = ({ width, grid }: { width: number; grid: ProductGrid }) => {
    if (!width || !grid) {
      return
    }
    screenStore.setScreenWidth({ width })
    const { currentScreenWidth } = storeToRefs(screenStore)
    const screenWidth = currentScreenWidth.value ?? 'xl'
    columnCount.value = grid.columns[screenWidth]
  }

  const setRelatedQueriesApiEnabled = (enabled: boolean | null) => {
    relatedQueriesApiEnabled.value = enabled
  }

  const setAddToCartAmount = (newAddToCartAmount: number) => {
    if (!newAddToCartAmount) {
      return
    }
    addToCartAmount.value = newAddToCartAmount
  }

  const setLayout = (newLayout: ResultsLayout) => {
    if (!newLayout) {
      return
    }
    layout.value = newLayout as ResultsLayoutEnum
  }

  const setLoading = (state: boolean) => {
    loading.value = state || false
  }

  const clearSearchResult = () => {
    searchResult.value = {} as SearchQueryResult
  }

  const filterVisibleFilterValues = (key: string, items: FacetGroupItem[] = []) => {
    if (
      !hideFiltersOnExactMatchForKeys.value?.length ||
      !hideFiltersOnExactMatchForKeys.value.includes(key) ||
      !items.length
    ) {
      return items
    }
    const searchInput = getNormalizedString(currentQueryText.value)
    const hasExactMatch = items.some((item) => getNormalizedString(item.title) === searchInput)
    return hasExactMatch
      ? items.filter((item) => getNormalizedString(item.title) === searchInput)
      : items
  }

  const setRelatedCategoryChildren = (children: Record<string, string>[]) => {
    relatedCategoryChildren.value = [...children]
  }

  const preconfiguredRelatedQueryKeys = computed(() => {
    return searchResultOptions.value?.relatedQueries?.source?.queries?.map((q) => q.facetKey) ?? []
  })

  const relatedQueryFacetKeys = computed(() => {
    const keysFromRelatedResults =
      relatedQueriesResult.value?.relatedQueries?.map((rq) => rq.facetKey) ?? []
    return Array.from(new Set([...preconfiguredRelatedQueryKeys.value, ...keysFromRelatedResults]))
  })

  const queryRelatedQueries = async (
    queryKey: string,
    publicQuery: PublicQuery,
    result: SearchQueryResult,
    options: SdkOptions
  ) => {
    loadingRelatedQueries.value = true
    const context = getLupaTrackingContext()
    const searchText = result.suggestedSearchText ?? result.searchText ?? ''
    const publicQueryFiltersWithoutRelatedKeys = { ...(publicQuery.filters ?? {}) }
    relatedQueryFacetKeys.value.forEach((facetKey) => {
      delete publicQueryFiltersWithoutRelatedKeys[facetKey]
    })
    const hasRemainingFilters = Object.keys(publicQueryFiltersWithoutRelatedKeys ?? {}).length > 0
    const query = {
      ...publicQuery,
      searchText,
      filters: hasRemainingFilters ? publicQueryFiltersWithoutRelatedKeys : undefined,
      ...context,
      modifiers: { facets: false, refiners: true }
    }
    lupaSearchSdk
      .queryRelated(queryKey, query, options)
      .then((res) => {
        if (!(res as SdkError).success) {
          return
        }
        relatedQueriesResult.value = res as RelatedQueries
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        loadingRelatedQueries.value = false
      })
  }

  return {
    isMobileSidebarVisible,
    searchResult,
    columnCount,
    addToCartAmount,
    facets,
    filters,
    loading,
    loadingFacets,
    loadingRefiners,
    layout,
    currentQueryText,
    totalItems,
    hasResults,
    labeledFilters,
    displayFilters,
    currentFilterCount,
    currentFilterKeys,
    hasAnyFilter,
    itemRange,
    isPageEmpty,
    hideFiltersOnExactMatchForKeys,
    relatedCategoryChildren,
    searchRequestResults,
    relatedQueriesResult,
    relatedQueriesApiEnabled,
    lastResultsSource,
    relatedQueryFacetKeys,
    setSidebarState,
    queryFacet,
    setLastRequestId,
    add,
    addPartial,
    setColumnCount,
    setAddToCartAmount,
    setLayout,
    setLoading,
    clearSearchResult,
    filterVisibleFilterValues,
    setRelatedCategoryChildren,
    queryRelatedQueries,
    setRelatedQueriesApiEnabled
  }
})
