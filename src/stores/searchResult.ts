import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, type Ref } from 'vue'
import lupaSearchSdk from '@getlupa/client-sdk'
import type { FacetGroup, FacetGroupItem, SearchQueryResult } from '@getlupa/client-sdk/Types'
import { ResultsLayoutEnum, type ResultsLayout } from '@/types/search-results/ResultsLayout'
import { getLabeledFilters, unfoldFilters } from '@/utils/filter.utils'
import { useOptionsStore } from './options'
import { useParamsStore } from './params'
import { disableBodyScroll, enableBodyScroll } from '@/utils/scroll.utils'
import { setDocumentTitle } from '@/utils/document.utils'
import type { ProductGrid } from '@/types/search-results/SearchResultsOptions'
import { useScreenStore } from './screen'
import { getNormalizedString } from '@/utils/string.utils'

export const useSearchResultStore = defineStore('searchResult', () => {
  const searchResult: Ref<SearchQueryResult> = ref({} as SearchQueryResult)
  const columnCount = ref(2)
  const addToCartAmount = ref(1)
  const layout = ref(ResultsLayoutEnum.GRID)
  const loading = ref(false)
  const isMobileSidebarVisible = ref(false)

  const optionsStore = useOptionsStore()
  const paramsStore = useParamsStore()
  const screenStore = useScreenStore()

  const { searchResultOptions } = storeToRefs(optionsStore)

  const facets = computed(() => searchResult.value.facets)

  const filters = computed(() => searchResult.value.filters)

  const currentQueryText = computed(() => searchResult.value.searchText)

  const totalItems = computed(() => searchResult.value.total)

  const hasResults = computed(() => totalItems.value > 0)

  const priceKeys = computed((): string[] => {
    return searchResultOptions.value?.priceKeys ?? []
  })

  const currency = computed((): string => {
    return searchResultOptions.value?.labels?.currency ?? ''
  })

  const priceSeparator = computed((): string => {
    return searchResultOptions.value?.labels?.priceSeparator ?? ''
  })

  const labeledFilters = computed(() =>
    getLabeledFilters(
      unfoldFilters(filters.value, {
        keys: priceKeys.value,
        currency: currency.value,
        separator: priceSeparator.value
      }),
      facets.value
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

  const setSidebarState = ({ visible }: { visible: boolean }) => {
    if (visible) {
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

  const add = (newSearchResult: SearchQueryResult) => {
    if (!newSearchResult) {
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
    searchResult.value = newSearchResult

    return { searchResult: newSearchResult }
  }

  const setColumnCount = ({ width, grid }: { width: number; grid: ProductGrid }) => {
    if (!width || !grid) {
      return
    }
    const { currentScreenWidth } = storeToRefs(screenStore)
    const screenWidth = currentScreenWidth.value ?? 'xl'
    columnCount.value = grid.columns[screenWidth]
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

  return {
    isMobileSidebarVisible,
    searchResult,
    columnCount,
    addToCartAmount,
    facets,
    filters,
    loading,
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
    setSidebarState,
    queryFacet,
    add,
    setColumnCount,
    setAddToCartAmount,
    setLayout,
    setLoading,
    clearSearchResult,
    filterVisibleFilterValues
  }
})
