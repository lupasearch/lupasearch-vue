import { SdkOptions } from '@/types/General'
import { SearchBoxPanel } from '@/types/search-box/SearchBoxPanel'

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
    close: 'Close',
    searchInputAriaLabel: 'Search for products'
  },
  links: {
    searchResults: '/catalogsearch/result'
  },
  voiceSearch: {
    enabled: true,
    queryKey: 'jnovl7k0kkvd',
    stopDelay: 700,
    timesliceLimit: 4,
    timesliceLength: 1000,
    sampleRate: 16000,
    labels: {
      listening: 'Listening...',
      microphoneOff: 'Microphone is off. Try again.',
      serviceError: 'Service error during transcription',
      microphoneNotFound: 'No microphone found. Please connect a microphone and try again.',
      microphoneNotAllowed: 'Microphone access denied. Please allow microphone access in your browser settings',
      connecting: 'Connecting...'
    },
    customVoiceServiceUrl: 'ws://localhost:3001'
  },
  searchTitlePosition: 'search-results-top',
  hideMoreResultsButtonOnNoResults: true,
  showNoResultsPanel: true,
  expandOnSinglePanel: true,
  callbacks: {
    onSearchBoxResults: (context) => {
      console.log('searchBoxResults', context)
    },
    onSearchResultsNavigate: (context) => {
      console.log('searchBoxNavigate', context)
    }
  },
  panels: [
    {
      type: 'suggestion',
      queryKey: '0qe99gfdyrrp',
      highlight: true,
      limit: 10,
      labels: {
        topResultsTitle: 'Popular searches:'
      }
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
      customDocumentHtmlAttributes: (doc: any) => {
        return {
          'data-id': doc.id,
          'data-name': doc.name
        }
      },
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
        },
        {
          type: 'addToCart',
          labels: {
            addToCart: 'Į krepšelį'
          },
          display: (doc: any) => {
            return true
          },
          action: async (doc: any) => {
            console.log('adding', doc)
          }
        }
      ]
    }
  ] as SearchBoxPanel[],
  history: {
    labels: {
      clear: 'Clear History'
    },
    historyLimit: 5
  }
}
