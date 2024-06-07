import { SearchQueryResult } from '@getlupa/client-sdk/Types'
import type { SdkOptions } from '../General'
import type { RoutingBehavior } from '../search-results/RoutingBehavior'
import type { DynamicData } from '../search-results/SearchResultsOptions'
import type { SearchBoxHistory } from './SearchBoxHistory'
import type { SearchBoxPanel } from './SearchBoxPanel'
import { DisplaySuggestion } from './Common'
import { QueryParams } from '../search-results/QueryParams'
import { RedirectionOptions } from '../redirections/RedirectionOptions'

export type SearchBoxOptions = SearchBoxPanelOptions & {
  inputSelector: string
  searchTriggers?: string[]
  routingBehavior?: RoutingBehavior
  dynamicData?: DynamicData
  callbacks?: SearchBoxEventCallbacks
  redirections?: RedirectionOptions
}

export type SearchBoxOptionLabels = {
  placeholder: string
  noResults: string
  moreResults: string
  currency: string
  priceSeparator?: string
  defaultFacetLabel?: string
  close?: string
  searchInputAriaLabel?: string
  closePanel?: string;
}

export type SearchBoxOptionLinks = {
  searchResults: string
}

export type SearchBoxInputOptions = {
  minInputLength: number
  labels: SearchBoxOptionLabels
  links: SearchBoxOptionLinks
  inputAttributes?: Record<string, string>
}

export type SearchBoxResultCallbackContext = {
  hasAnyResults?: boolean
  docResults?: Record<string, SearchQueryResult>
  suggestionResults?: Record<string, DisplaySuggestion[]>
  totalCount?: number
  panelItemCounts?: { queryKey: string; count: number }[]
  inputValue?: string
}

export type SearchBoxResultsNavigateContext = {
  params: QueryParams & { query: string }
}

export type SearchBoxEventCallbacks = {
  onSearchBoxResults?: (context: SearchBoxResultCallbackContext) => unknown
  onSearchResultsNavigate?: (context: SearchBoxResultsNavigateContext) => unknown
}

export type SearchBoxPanelOptions = SearchBoxInputOptions & {
  history: SearchBoxHistory
  panels: SearchBoxPanel[]
  options: SdkOptions
  debounce?: number
  showTotalCount?: boolean
  showNoResultsPanel?: boolean
  hideMoreResultsButtonOnNoResults?: boolean
  expandOnSinglePanel?: boolean
}
