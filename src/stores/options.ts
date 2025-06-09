import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { SearchBoxOptions } from '@/types/search-box/SearchBoxOptions'
import { DEFAULT_SEARCH_BOX_OPTIONS } from '@/constants/searchBox.const'
import { DEFAULT_OPTIONS_RESULTS } from '@/constants/searchResults.const'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import type { LupaQueryParamValue, TrackingOptions } from '@/types/General'
import type { FilterGroup } from '@getlupa/client-sdk/Types'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_SELECTION } from '@/constants/global.const'
import { useScreenStore } from './screen'
import { ProductRecommendationOptions } from '@/types/recommendations/RecommendationsOptions'

export const useOptionsStore = defineStore('options', () => {
  const searchBoxOptions: Ref<SearchBoxOptions> = ref(
    DEFAULT_SEARCH_BOX_OPTIONS as SearchBoxOptions
  )

  const searchResultOptions: Ref<SearchResultsOptions> = ref(
    DEFAULT_OPTIONS_RESULTS as SearchResultsOptions
  )

  const trackingOptions: Ref<TrackingOptions> = ref({})

  const searchResultInitialFilters: Ref<FilterGroup> = ref({})

  const productRecommendationOptions: Ref<Partial<ProductRecommendationOptions>> = ref({})

  const screenStore = useScreenStore()

  const classMap = computed(() => searchResultOptions.value.classMap ?? {})

  const initialFilters = computed(() => searchResultInitialFilters.value)

  const boxRoutingBehavior = computed(() => searchBoxOptions.value.routingBehavior ?? 'direct-link')

  const searchResultsRoutingBehavior = computed(
    () => searchResultOptions.value.routingBehavior ?? 'direct-link'
  )

  const defaultSearchResultPageSize = computed(
    () => currentResolutionPageSizes.value?.[0] ?? DEFAULT_PAGE_SIZE
  )

  const currentResolutionPageSizes = computed(() => {
    const pageSizes =
      searchResultOptions.value?.pagination?.sizeSelection?.sizes ?? DEFAULT_PAGE_SIZE_SELECTION
    if (Array.isArray(pageSizes)) {
      return pageSizes
    }
    const screenSize = screenStore.currentScreenWidth
    switch (screenSize) {
      case 'xs':
        return pageSizes.xs
      case 'sm':
        return pageSizes.sm
      case 'md':
        return pageSizes.md
      case 'l':
        return pageSizes.l
      case 'xl':
        return pageSizes.xl
    }
  })

  const setSearchBoxOptions = ({ options }: { options: SearchBoxOptions }) => {
    searchBoxOptions.value = options
  }

  const setTrackingOptions = ({ options }: { options: TrackingOptions }) => {
    trackingOptions.value = options
  }

  const setSearchResultOptions = ({ options }: { options: SearchResultsOptions }) => {
    searchResultOptions.value = options
  }

  const setInitialFilters = ({ initialFilters }: { initialFilters: FilterGroup }) => {
    searchResultInitialFilters.value = initialFilters
  }

  const setProductRecommendationOptions = ({
    options
  }: {
    options: ProductRecommendationOptions
  }) => {
    productRecommendationOptions.value = options
  }

  const getQueryParamName = (param: LupaQueryParamValue) => {
    const nameMap = searchBoxOptions.value.queryParameterNames
    return nameMap?.[param] ?? param
  }

  return {
    searchBoxOptions,
    searchResultOptions,
    trackingOptions,
    classMap,
    initialFilters,
    boxRoutingBehavior,
    searchResultsRoutingBehavior,
    defaultSearchResultPageSize,
    currentResolutionPageSizes,
    productRecommendationOptions,
    setSearchBoxOptions,
    setTrackingOptions,
    setSearchResultOptions,
    setInitialFilters,
    setProductRecommendationOptions,
    getQueryParamName
  }
})
