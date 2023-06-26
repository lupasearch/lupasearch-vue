import type { SearchBoxOptions } from '@/types/search-box/SearchBoxOptions'
import type { SearchContainerOptions } from '@/types/search-container/SearchContainerOptions'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import { SEARCH_BOX_CONFIGURATION } from './searchBoxDev.const'
import { SEARCH_RESULTS_CONFIGURATION } from './searchResultsDev.const'

export const SEARCH_CONAINER_CONFIGURATION: SearchContainerOptions = {
  trigger: '',
  searchBox: SEARCH_BOX_CONFIGURATION as unknown as SearchBoxOptions,
  searchResults: SEARCH_RESULTS_CONFIGURATION as unknown as SearchResultsOptions
}
