import { SearchContainerOptions, SearchBoxOptions, SearchResultsOptions } from '@getlupa/vue'
import { SEARCH_BOX_CONFIGURATION } from './searchBoxDev.const'
import { SEARCH_RESULTS_CONFIGURATION } from './searchResultsDev.const'

export const SEARCH_CONAINER_CONFIGURATION: SearchContainerOptions = {
  trigger: '',
  searchBox: SEARCH_BOX_CONFIGURATION as unknown as SearchBoxOptions,
  searchResults: SEARCH_RESULTS_CONFIGURATION as unknown as SearchResultsOptions
}
