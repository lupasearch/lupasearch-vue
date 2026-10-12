/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AnchorPosition } from '@/types/search-results/SearchResultsProductCardOptions'
import type { FacetStyle } from '@/types/search-results/SearchResultsOptions'
import type { DeepSearchOptions } from '@/types/search-results/DeepSearchOptions'

export const DEFAULT_OPTIONS_RESULTS = {
  options: {
    environment: 'production'
  },
  queryKey: '',
  containerSelector: '#searchResultsContainer',
  searchTitlePosition: 'page-top',
  labels: {
    pageSize: 'Page size:',
    sortBy: 'Sort by:',
    suggestedSort: 'Suggested sort',
    itemCount: 'Items {1} of {2}',
    filteredItemCount: '',
    currency: '€',
    showMore: 'Show more',
    searchResults: 'Search Query: ',
    emptyResults: 'There are no results for the query:',
    mobileFilterButton: 'Filter',
    mobileFilterCloseButton: '',
    htmlTitleTemplate: "Search Query: '{1}'",
    noResultsSuggestion: 'No results found for this query: {1}',
    didYouMean: 'Did you mean to search: {1}',
    similarQuery: 'Search results for phrase {1}',
    similarQueries: 'Similar queries:',
    similarResultsLabel: 'Related to your query:'
  },
  grid: {
    columns: {
      xl: 4,
      l: 3,
      md: 2,
      sm: 2,
      xs: 1
    }
  },
  pagination: {
    sizeSelection: {
      position: {
        top: false,
        bottom: true
      },
      sizes: [10, 20, 25]
    },
    pageSelection: {
      position: {
        top: false,
        bottom: true
      },
      display: 5,
      displayMobile: 3
    }
  },
  sort: [],
  filters: {
    currentFilters: {
      visibility: {
        mobileSidebar: true,
        mobileToolbar: true
      },
      labels: {
        title: 'Current filters:',
        clearAll: 'Clear all'
      }
    },
    facets: {
      labels: {
        title: 'Filters:',
        showAll: 'Show more',
        facetFilter: 'Filter...',
        facetClear: 'Clear'
      },
      filterable: {
        minValues: 5
      },
      hierarchy: {
        maxInitialLevel: 2,
        topLevelValueCountLimit: 5,
        filterable: true
      },
      facetValueCountLimit: 20,
      showDocumentCount: true,
      style: {
        type: 'sidebar' as FacetStyle
      }
    }
  },
  toolbar: {
    layoutSelector: true,
    itemSummary: true,
    clearFilters: false
  },
  isInStock: (): boolean => {
    return true
  },
  badges: {
    anchor: 'tr' as AnchorPosition,
    elements: []
  },
  links: {
    details: '/{id}'
  },
  elements: [],
  breadcrumbs: []
}

export const DEFAULT_BEST_PRODUCTS_LIMIT = 3

export const DEFAULT_DEEP_SEARCH_OPTIONS: DeepSearchOptions = {
  enabled: false,
  mode: 'regular',
  regular: {
    precheck: false,
    loader: 'dialog',
    showExplanation: true,
    labels: {
      loading: 'Running deep search',
      explanationFallback: 'Results refined by deep search',
      clear: 'Show all results'
    }
  },
  bestProducts: {
    limit: DEFAULT_BEST_PRODUCTS_LIMIT,
    showProducts: true,
    showExplanation: true,
    showSuggestedFilters: true,
    labels: {
      title: 'Best matches from deep search',
      loading: 'Finding best matches with deep search',
      trigger: 'Find best matches with deep search',
      explanationFallback: '',
      suggestedFiltersTitle: 'Filters suggested by deep search',
      applyFilters: 'Apply suggested filters',
      expandProducts: 'Show products',
      collapseProducts: 'Hide products'
    }
  }
}
