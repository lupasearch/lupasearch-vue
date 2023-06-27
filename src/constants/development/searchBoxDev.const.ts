import { SdkOptions } from '@getlupa/vue'
import { SearchBoxPanel } from '@getlupa/vue/dist/src/types/search-box/SearchBoxPanel'

export const SEARCH_BOX_CONFIGURATION = {
  options: {
    environment: 'production'
  } as SdkOptions,
  minInputLength: 2,
  showTotalCount: true,
  inputAttributes: {
    name: 'q'
  },
  debounce: 0,
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
      queryKey: '0qe99gfdyrrp',
      highlight: true,
      limit: 10
    },
    {
      type: 'document',
      queryKey: 'jnovl7k0kkvd',
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
            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/638px-Placeholder_view_vector.svg.png',
          key: 'image'
        },
        {
          type: 'title',
          key: 'name'
        },
        {
          type: 'custom',
          key: 'brand'
        },
        {
          type: 'price',
          key: 'price'
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
