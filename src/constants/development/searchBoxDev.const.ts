/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SdkOptions } from '@/types/General'
import type { SearchBoxPanel } from '@/types/search-box/SearchBoxPanel'

export const SEARCH_BOX_CONFIGURATION = {
  options: {
    environment: 'production'
  } as SdkOptions,
  minInputLength: 2,
  showTotalCount: true,
  inputAttributes: {
    name: 'q'
  },
  debounce: 200,
  labels: {
    placeholder: 'Search for products...',
    noResults: 'There are no results found.',
    moreResults: 'Show more results',
    currency: '€',
    priceSeparator: ',',
    defaultFacetLabel: 'Brand:',
    close: 'Close'
  },
  links: {
    searchResults: '/catalogsearch/result'
  },
  searchTitlePosition: 'search-results-top',
  panels: [
    {
      type: 'suggestion',
      queryKey: 'ocmyudu2q6f3',
      highlight: true,
      limit: 10
    },
    {
      type: 'document',
      queryKey: '0zcly1frbyyi',
      limit: 5,
      searchBySuggestion: true,
      links: {
        details: '{url}'
      },
      titleKey: 'name',
      idKey: 'id',
      elements: [
        {
          type: 'image',
          placeholder:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/638px-Placeholder_view_vector.svg.png'
        },
        {
          type: 'title',
          key: 'product_name'
        },
        {
          type: 'regularPrice',
          key: 'regular_price',
          display: (doc: any) => doc.discount_price < doc.regular_price
        },
        {
          type: 'price',
          key: 'discount_price'
        }
      ]
    }
  ] as SearchBoxPanel[],
  history: {
    labels: {
      clear: 'Clear History'
    }
  }
}
