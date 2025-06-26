import { SdkOptions } from '@/types/General'
import { SearchBoxPanel } from '@/types/search-box/SearchBoxPanel'
import type { MultiCurrencyConfig } from '@/utils/price.utils'

export const SEARCH_BOX_CONFIGURATION = {
  sselectedCurrency: 'eur',
  currencies: [
    { key: 'eur', symbol: '€', template: '{1} €', separator: ',', multiplier: 1 },
    { key: 'usd', symbol: '$', template: '$ {1}', separator: '.', multiplier: 1.12 }
  ],
  options: {
    environment: 'production'
  } as SdkOptions,

  minInputLength: 2,
  showTotalCount: true,
  inputAttributes: { name: 'q' },
  debounce: 0,

  labels: {
    placeholder: 'Search for products...',
    noResults: 'There are no results found.',
    moreResults: 'Show more results',
    currency: '€',
    priceSeparator: ',',
    defaultFacetLabel: 'Brand:',
    close: 'Close',
    searchInputAriaLabel: 'Search for products'
  },

  links: { searchResults: '/catalogsearch/result' },
  searchTitlePosition: 'search-results-top',
  hideMoreResultsButtonOnNoResults: true,
  showNoResultsPanel: true,
  expandOnSinglePanel: true,

  callbacks: {
    onSearchBoxResults: (context) => console.log('searchBoxResults', context),
    onSearchResultsNavigate: (context) => console.log('searchBoxNavigate', context)
  },

  panels: [
    {
      type: 'suggestion',
      queryKey: '0qe99gfdyrrp',
      highlight: true,
      limit: 10,
      labels: { topResultsTitle: 'Popular searches:' }
    },
    {
      type: 'document',
      queryKey: 'jnovl7k0kkvd',
      limit: 5,
      searchBySuggestion: true,
      links: { details: '{url}' },
      titleKey: 'name',
      idKey: 'id',
      isInStock: (doc: any): boolean => Boolean(doc),
      customDocumentHtmlAttributes: (doc: any) => ({ 'data-id': doc.id, 'data-name': doc.name }),
      elements: [
        {
          type: 'image',
          key: 'image',
          placeholder:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/638px-Placeholder_view_vector.svg.png'
        },
        { type: 'title', key: 'name' },
        { type: 'custom', key: 'brand' },
        { type: 'price', key: 'price' },
        {
          type: 'addToCart',
          labels: { addToCart: 'Į krepšelį' },
          display: (doc: any) => true,
          action: async (doc: any) => console.log('adding', doc)
        }
      ]
    }
  ] as SearchBoxPanel[],

  history: {
    labels: { clear: 'Clear History' },
    historyLimit: 5
  }
}
