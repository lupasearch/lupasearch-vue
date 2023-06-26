import type { SdkOptions } from '@/types/General'
import type { DocumentElement } from '@/types/DocumentElement'
import type { SearchResultBadgeOptions } from '@/types/search-results/SearchResultsProductCardOptions'
import type { SearchResultsSortOptions } from '@/types/search-results/SearchResultsSort'

export const SEARCH_RESULTS_CONFIGURATION = {
  options: {
    environment: 'production'
  } as SdkOptions,
  queryKey: '0zcly1frbyyi',
  labels: {
    pageSize: 'Page size:',
    sortBy: 'Sort by:',
    itemCount: 'Items {1} of {2}',
    currency: '€',
    priceSeparator: ',',
    showMore: 'Show more',
    emptyResults: 'There are no results for the query:',
    noItemsInPage: 'There are no results in this page',
    backToFirstPage: 'Go back to the first page',
    mobileFilterButton: 'Filter',
    htmlTitleTemplate: "Search Query: '{1}'",
    noResultsSuggestion: 'No results found for this query: {1}',
    didYouMean: 'Did you mean to search: {1}',
    similarQuery: 'Search results for phrase {1}',
    similarQueries: 'Similar queries:',
    aiSuggestions: 'Other suggestions:'
  },
  toolbar: {
    totalCount: true
  },
  grid: {
    columns: {
      xl: 3,
      l: 3,
      md: 3,
      sm: 3,
      xs: 2
    }
  },
  pagination: {
    sizeSelection: {
      position: {
        top: true,
        bottom: false
      },
      sizes: [12, 24, 36, 72]
    },
    pageSelection: {
      position: {
        top: false,
        bottom: true
      },
      display: 5
    }
  },
  sort: [
    {
      key: 'relevance',
      label: 'Relevance',
      config: [{ _relevance: 'desc' }]
    },
    {
      key: 'nameDesc',
      label: 'Name (Descending)',
      config: [{ product_name: 'desc' }]
    },
    {
      key: 'nameAsc',
      label: 'Name (Ascending)',
      config: [{ product_name: 'asc' }]
    },
    {
      key: 'priceDesc',
      label: 'Price (High to Low)',
      config: [{ discount_price: 'desc' }]
    },
    {
      key: 'priceAsc',
      label: 'Price (Low to High)',
      config: [{ discount_price: 'asc' }]
    },
    {
      key: 'discountDesc',
      label: 'Biggest Discount',
      config: [{ discount: 'desc' }]
    }
  ] as SearchResultsSortOptions[],
  filters: {
    currentFilters: {
      visibility: {
        mobileSidebar: true,
        mobileToolbar: true,
        desktopToolbar: false,
        desktopSidebar: true
      },
      labels: {
        title: 'Current filters:',
        clearAll: 'Clear all'
      },
      mobileSidebar: {
        showFilterCount: false,
        activeFiltersExpanded: false
      },
      desktopToolbar: {
        activeFiltersExpanded: false
      }
    },
    facets: {
      labels: {
        title: 'Filters:',
        showAll: 'Show more',
        showLess: 'Show less',
        facetFilter: 'Filter...'
      },
      hierarchy: {
        maxInitialLevel: 2,
        topLevelValueCountLimit: 0,
        filterable: false
      },
      stats: {
        slider: true,
        inputs: true,
        labels: {
          from: 'From:',
          to: 'To:'
        }
      },
      filterable: {
        minValues: 10
      },
      facetValueCountLimit: 15,
      showDocumentCount: true
    }
  },
  isInStock: (): boolean => {
    return true
  },
  badges: {} as SearchResultBadgeOptions,
  links: {
    details: '{url}'
  },
  idKey: 'id',
  titleKey: 'name',
  elements: [
    {
      type: 'image',
      placeholder:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/638px-Placeholder_view_vector.svg.png'
    },
    {
      type: 'title',
      key: 'product_name',
      isHtml: false,
      link: false,
      maxLines: 2
    },
    {
      type: 'custom',
      key: 'id',
      className: 'lupa-custom-id'
    },
    {
      type: 'custom',
      key: 'brand',
      className: 'lupa-custom-brand'
    },
    {
      type: 'customHtml',
      display: (doc: Record<string, string>) => doc.discount_price < doc.regular_price,
      html: (doc: Record<string, string>) => {
        const discountPrice = parseFloat(doc.discount_price)?.toFixed(2)?.replace('.', ',')
        const regularPrice = parseFloat(doc.regular_price)?.toFixed(2)?.replace('.', ',')
        const discount = `<span class="lupa-discount">${discountPrice} €</span>`
        const regular = `<span class="lupa-regular">${regularPrice} €</span>`
        return discount + regular
      }
    },
    {
      type: 'customHtml',
      display: (doc: Record<string, string>) => doc.discount_price >= doc.regular_price,
      html: (doc: Record<string, string>) => {
        const price = parseFloat(doc.regular_price)?.toFixed(2)?.replace('.', ',')
        return `<span class="lupa-final">${price} €</span>`
      }
    }
  ] as DocumentElement[],
  breadcrumbs: [{ label: 'Main', link: '/' }, { label: 'Search: {1}' }]
}
