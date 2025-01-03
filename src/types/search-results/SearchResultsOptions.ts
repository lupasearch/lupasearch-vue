import type { SdkOptions } from '../General'
import type { CategoryFilterOptions } from '../product-list/ProductListOptions'
import type { SearchResultsAdditionalPanelOptions } from './SearchResultsAdditionalPanelOptions'
import type { SearchResultsProductCardOptions } from './SearchResultsProductCardOptions'
import type { SearchResultsSortOptions } from './SearchResultsSort'
import { RedirectionOptions } from '../redirections/RedirectionOptions'
import { RelatedQueryOptions } from './RelatedQueryOptions'
import { RedirectionSuggestionOptions } from './RedirectionSuggestionOptionts'
import { FilterGroup } from '@getlupa/client-sdk/Types'
import { DataExtraction } from '../DataExtraction'

export type SearchResultsOptions = SearchResultsProductOptions &
  SearchResultsAdditionalPanels & {
    containerSelector: string
    breadcrumbs: SearchResultsBreadcrumb[]
    classMap?: Record<string, string>
    disallowEmptyQuery?: boolean
    callbacks?: SearchResultEventCallbacks
    categories?: CategoryFilterOptions
    dynamicData?: DynamicData
    ssr?: SsrOptions
    redirections?: RedirectionOptions
    scrollToResults?: ScrollToResultsOptions
    initialFilters?: FilterGroup | Record<string, DataExtraction>
  }

export type ScrollToResultsOptions = {
  enabled?: boolean
  scrollToContainerSelector?: string
  timeout?: number
}

export type SsrOptions = {
  baseUrl?: string
  url?: string
}

export type SearchTitlePosition = 'page-top' | 'search-results-top'

export type SearchResultsDidYouMeanLabels = {
  noResultsSuggestion: string
  didYouMean: string
}

export type SearchResultsSimilarQueriesLabels = {
  similarQuery: string
  similarQueries: string
  aiSuggestions?: string
}

export type SearchResultsSimilarResultsLabels = {
  similarResultsLabel: string
}

export type CallbackContext = {
  queryKey: string
  hasResults?: boolean
  urlQueryString?: string
  productId?: string
}

export type SortCallbackContext = {
  selectedSortKey: string
  previousSortKey?: string
}

export type ResultCallbackContext = CallbackContext & {
  params: Record<string, any>
}

export type SearchResultEventCallbacks = {
  onSearchResults?: (context: ResultCallbackContext) => unknown
  onAdditionalPanelResults?: (context: CallbackContext) => unknown
  onCategoryFilterResults?: (context: CallbackContext) => unknown
  onProductClick?: (context: CallbackContext) => unknown
  onUrlQueryChange?: (context: CallbackContext) => unknown
  onSortChange?: (context: SortCallbackContext) => unknown
  onMounted?: () => unknown
}

export type SearchResultsOptionLabels = SearchResultsPaginationLabels &
  SearchResultsDidYouMeanLabels &
  SearchResultsSimilarQueriesLabels &
  SearchResultsSimilarResultsLabels & {
    sortBy: string
    currency: string
    priceSeparator?: string
    searchResults?: string
    searchResultsCount?: string
    itemCount: string
    emptyResults: string
    mobileFilterButton: string
    htmlTitleTemplate: string
    outOfStock?: string
    noItemsInPage?: string
    backToFirstPage?: string
    toolbarRightLabel?: string
    toolbarLeftLabel?: string
  }

export type SearchResultsAdditionalPanels = {
  additionalPanels?: SearchResultsAdditionalPanelOptions[]
}

export type SearchResultsProductOptions = SearchResultsProductCardOptions &
  SearchResultsAdditionalPanels & {
    grid: ProductGrid
    options: SdkOptions
    queryKey: string
    pagination: SearchResultsPagination
    sort: SearchResultsSortOptions[]
    filters?: SearchResultsFilterOptions
    searchTitlePosition?: string
    hideResultsOnReload?: boolean
    relatedQueries?: RelatedQueryOptions
    redirectionSuggestions?: RedirectionSuggestionOptions[]
    toolbar?: {
      layoutSelector?: boolean
      itemSummary?: boolean
      clearFilters?: boolean
      totalCount?: boolean
    }
  }

export type ProductGrid = {
  columns: {
    xl: number
    l: number
    md: number
    sm: number
    xs: number
  }
  sizes?: {
    sm?: number
    md?: number
    l?: number
    xl?: number
  }
  forcedScreenWidth?: number
}

export type SearchResultsPaginationLabels = {
  pageSize: string
  showMore: string
  showLess?: string
  pageSizePrefix?: string
}

export type ResponsiveSearchResultPageSizes = {
  xs: number[]
  sm: number[]
  md: number[]
  l: number[]
  xl: number[]
}

export type SearchResultPageSizes = number[] | ResponsiveSearchResultPageSizes

export type SearchResultsPagination = {
  sizeSelection: {
    sizes: SearchResultPageSizes
    position: SearchResultsPaginationPosition
    labels?: {
      pageSizePrefix: string
    }
  }
  pageSelection: {
    position: SearchResultsPaginationPosition
    display: number
    displayMobile: number
  }
}

export type SearchResultsPaginationPosition = {
  top: boolean
  bottom: boolean
}

export type ResultCurrentFilterOptions = {
  labels: {
    title: string
    clearAll: string
  }
  visibility?: {
    mobileSidebar?: boolean
    mobileToolbar?: boolean
    desktopSidebar?: boolean
    desktopToolbar?: boolean
  }
  mobileSidebar?: {
    showFilterCount?: boolean
    activeFiltersExpanded?: boolean
  }
  desktopToolbar?: {
    activeFiltersExpanded?: boolean
    position?: 'pageTop' | 'resultsTop'
  }
}

export type FacetStyle = 'sidebar' | 'top-dropdown'

export type FilterBehavior = 'immediate' | 'withFilterButton'

export type FacetFilterQuery = {
  queryKey: string
}

export type ResultFacetOptions = {
  labels: {
    title: string
    showAll: string
    showLess?: string
    facetFilter: string
    facetClear?: string
    facetFilterButton?: string
  }
  hideFiltersOnExactMatchForKeys?: string[]
  promotedFacets?: string[]
  filterBehavior?: FilterBehavior
  filterable?: {
    minValues: number
  }
  hierarchy?: {
    maxInitialLevel: number
    topLevelValueCountLimit?: number
    filterable?: boolean
    behavior?: 'append' | 'replace'
  }
  stats?: {
    slider?: boolean
    inputs?: boolean
    interval?: number
    pricePrecisionDigits?: number
    labels?: {
      from?: string
      to?: string
      ariaFrom?: string
      ariaTo?: string
      sliderDotAriaLabel?: string
    }
  }
  facetValueCountLimit?: number
  showDocumentCount?: boolean
  style?: {
    type: FacetStyle
  }
  exclude?: string[]
  expand?: string[]
  facetFilterQueries?: Record<string, FacetFilterQuery>
}

export type SearchResultsFilterOptions = {
  currentFilters?: ResultCurrentFilterOptions
  facets?: ResultFacetOptions
  categories?: CategoryFilterOptions
}

export type SearchResultsBreadcrumb = { label: string; link?: string }

export type DynamicData = {
  enabled?: boolean
  cache?: boolean
  handler?: (documentIds: string[]) => Promise<Record<'id' | string, unknown>[]>
}
