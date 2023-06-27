import {
  SdkOptions,
  SearchResultsSortOptions,
  BadgeGenerateSeed,
  DocumentElement
} from '@getlupa/vue'

export const SEARCH_RESULTS_CONFIGURATION = {
  options: {
    environment: 'production'
  } as SdkOptions,
  queryKey: 'jnovl7k0kkvd',
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
    htmlTitleTemplate: "Search Query: '{1}' zeeawaw",
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
      xl: 5,
      l: 4,
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
        mobileSidebar: false,
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
        activeFiltersExpanded: true
      },
      desktopToolbar: {
        activeFiltersExpanded: true
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
  isInStock: (doc: any): boolean => {
    return Boolean(doc)
  },
  links: {
    details: '{url}'
  },
  idKey: 'id',
  titleKey: 'name',
  elements: [
    {
      type: 'image',
      key: 'image',
      placeholder:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/638px-Placeholder_view_vector.svg.png'
    },
    {
      type: 'custom',
      key: 'brand',
      className: 'lupa-custom-brand',
      action: (doc: any) => console.log('brand click', doc)
    },
    {
      type: 'title',
      key: 'name',
      isHtml: false,
      link: false,
      className: "bold",
      maxLines: 2
    },
    {
      type: 'description',
      key: 'description',
      maxLines: 3
    },
    {
      type: 'customHtml',
      display: (doc: Record<string, string>) => doc.price < doc.price,
      html: (doc: Record<string, string>) => {
        const discountPrice = parseFloat(doc.price)?.toFixed(2)?.replace('.', ',')
        const regularPrice = parseFloat(doc.price)?.toFixed(2)?.replace('.', ',')
        const discount = `<span class="lupa-discount">${discountPrice} €</span>`
        const regular = `<span class="lupa-regular">${regularPrice} €</span>`
        return discount + regular
      },
      action: (doc: any) => console.log('price 1 click', doc)
    },
    {
      type: 'customHtml',
      display: (doc: Record<string, string>) => doc.price >= doc.price,
      html: (doc: Record<string, string>) => {
        const price = parseFloat(doc.price)?.toFixed(2)?.replace('.', ',')
        return `<span class="lupa-final">${price} €</span>`
      },
      action: (doc: any) => console.log('price 2 click', doc)
    }
  ] as DocumentElement[],
  breadcrumbs: [{ label: 'Main', link: '/link-to-someplace/' }, { label: 'Search: {1}' }],
  dynamicData: {
    enabled: true,
    handler: async (ids: string[]) => {
      console.log('requesting dynamic data for ids', ids)
    }
  }
}
