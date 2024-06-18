import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'
import lupaSearchSdk from '@getlupa/client-sdk'
import type { FacetGroup, SearchQueryResult } from '@getlupa/client-sdk/Types'
import { ResultsLayoutEnum, type ResultsLayout } from '@/types/search-results/ResultsLayout'
import { getLabeledFilters, unfoldFilters } from '@/utils/filter.utils'
import { useOptionsStore } from './options'
import { useParamsStore } from './params'
import { S_MIN_WIDTH, MD_MIN_WIDTH, L_MIN_WIDTH, XL_MIN_WIDTH } from '@/constants/global.const'
import { disableBodyScroll, enableBodyScroll } from '@/utils/scroll.utils'
import { setDocumentTitle } from '@/utils/document.utils'
import type { ProductGrid } from '@/types/search-results/SearchResultsOptions'

export const useSearchResultStore = defineStore('searchResult', () => {
  const searchResult: Ref<SearchQueryResult> = ref({} as SearchQueryResult)
  const columnCount = ref(2)
  const addToCartAmount = ref(1)
  const layout = ref(ResultsLayoutEnum.GRID)
  const loading = ref(false)
  const isMobileSidebarVisible = ref(false)

  const optionsStore = useOptionsStore()
  const paramsStore = useParamsStore()

  const facets = computed(() => searchResult.value.facets)

  const filters = computed(() => searchResult.value.filters)

  const currentQueryText = computed(() => searchResult.value.searchText)

  const totalItems = computed(() => searchResult.value.total)

  const hasResults = computed(() => totalItems.value > 0)

  const labeledFilters = computed(() =>
    getLabeledFilters(unfoldFilters(filters.value), facets.value)
  )

  const displayFilters = computed(() => {
    const initialFilters = optionsStore.initialFilters
    return labeledFilters.value?.filter((f) => !initialFilters?.[f.key]) ?? []
  })

  const currentFilterCount = computed(() => displayFilters.value?.length ?? 0)

  const currentFilterKeys = computed(() => Object.keys(filters.value ?? {}))

  const hasAnyFilter = computed(() => Object.keys(filters.value ?? {}).length > 0)

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

    if (width <= S_MIN_WIDTH) {
      columnCount.value = grid.columns.xs
    } else if (width > S_MIN_WIDTH && width <= MD_MIN_WIDTH) {
      columnCount.value = grid.columns.sm
    } else if (width > MD_MIN_WIDTH && width <= L_MIN_WIDTH) {
      columnCount.value = grid.columns.md
    } else if (width > L_MIN_WIDTH && width <= XL_MIN_WIDTH) {
      columnCount.value = grid.columns.l
    } else {
      columnCount.value = grid.columns.xl
    }
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
    setSidebarState,
    queryFacet,
    add,
    setColumnCount,
    setAddToCartAmount,
    setLayout,
    setLoading,
    clearSearchResult
  }
})
