export const DEFAULT_SEARCH_BOX_OPTIONS = {
  inputSelector: '#searchBox',
  options: {
    environment: 'production'
  },
  showTotalCount: false,
  minInputLength: 1,
  inputAttributes: {
    name: 'q'
  },
  debounce: 0,
  labels: {
    placeholder: 'Search for products...',
    noResults: 'There are no results found.',
    moreResults: 'Show more results',
    currency: '€',
    defaultFacetLabel: 'Category:'
  },
  links: {
    searchResults: '/search'
  },
  panels: [
    {
      type: 'suggestion',
      queryKey: '',
      highlight: true,
      limit: 5
    },
    {
      type: 'document',
      queryKey: '',
      limit: 5,
      searchBySuggestion: false,
      links: {
        details: '{url}'
      },
      titleKey: 'name',
      elements: []
    }
  ],
  history: {
    labels: {
      clear: 'Clear History'
    }
  }
}
