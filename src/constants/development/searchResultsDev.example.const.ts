import { DocumentElement } from '@/types/DocumentElement'
import { SdkOptions } from '@/types/General'
import { FacetStyle } from '@/types/search-results/SearchResultsOptions'
import { SearchResultsSortOptions } from '@/types/search-results/SearchResultsSort'
import type { MultiCurrencyConfig } from '@/utils/price.utils' 
import { formatPrice }     from '@/utils/price.utils'   

export const SEARCH_RESULTS_CONFIGURATION = {
 options: {
     environment: 'production',
   selected: 'eur',
     currencies: [
       { key: 'eur', 
         symbol: '€', 
         template: '{1} €', 
         separator: ',', 
         multiplier: 1
       },
       { key: 'usd', 
         symbol: '$', 
         template: '$ {1}', 
        separator: '.', 
         multiplier: 1.12
       }
   ]
   } as SdkOptions & MultiCurrencyConfig,
   
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
    aiSuggestions: 'Other suggestions:',
    similarResultsLabel: 'Related to your query:'
  },
  toolbar: {
    layoutSelector: false,
    itemSummary: true,
    clearFilters: false
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
      sizes: [15, 30, 45, 60]
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
      config: [{ name: 'desc' }]
    },
    {
      key: 'nameAsc',
      label: 'Name (Ascending)',
      config: [{ name: 'asc' }]
    },
    {
      key: 'priceDesc',
      label: 'Price (High to Low)',
      config: [{ price: 'desc' }]
    },
    {
      key: 'priceAsc',
      label: 'Price (Low to High)',
      config: [{ price: 'asc' }]
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
          to: 'To:',
          ariaFrom: 'From',
          ariaTo: 'To',
          sliderDotAriaLabel: 'Slider dot'
        }
      },
      filterable: {
        minValues: 10
      },
      facetValueCountLimit: 15,
      showDocumentCount: true,
      style: {
        type: 'sidebar' as FacetStyle
      }
    }
  },
  isInStock: (doc: any): boolean => {
    return Boolean(doc)
  },
  customDocumentHtmlAttributes: (doc: any) => {
    return {
      'data-id': doc.id,
      'data-name': doc.name
    }
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
      className: 'bold',
      maxLines: 2
    },
    {
      type: 'description',
      key: 'description',
      maxLines: 3
    },
    {
      type: 'customHtml',
        display: (doc: Record<string, string>) => Number(doc.price) < Number(doc.price),
        html:    (doc: Record<string, string>) => {
        const disc = formatPrice(doc.discountPriceKey  ?? doc.price)
        const reg  = formatPrice(doc.regularPriceKey   ?? doc.price)
        return `<span class="lupa-discount">${disc}</span><span class="lupa-regular">${reg}</span>`
       },
       action:  (doc: any) => console.log('price 1 click', doc)
    },
      {
        type: 'customHtml',
          display: (doc: Record<string, string>) => Number(doc.price) >= Number(doc.price),
          html:    (doc: Record<string, string>) => {
          const finalPrice = formatPrice(doc.price)
          return `<span class="lupa-final">${finalPrice}</span>`
        },
        action:  (doc: any) => console.log('price 2 click', doc)
        }
  ] as DocumentElement[],
  breadcrumbs: [{ label: 'Main', link: '/link-to-someplace/' }, { label: 'Search: {1}' }],
  dynamicData: {
    enabled: true,
    handler: async (ids: string[]) => {
      console.log('requesting dynamic data for ids', ids)
    }
  },
  redirections: {
    enabled: true,
    queryKey: 'jnovl7k0kkvd',
    cacheSeconds: 3600,
    urlTransformer: (url: string) => {
      return `${url}`
    }
  },
  scrollToResults: {
    enabled: true,
    timeout: 500,
    scrollToContainerSelector: '#app'
  }
}
