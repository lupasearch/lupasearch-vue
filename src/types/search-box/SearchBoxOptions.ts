import { FilterGroup, SearchQueryResult } from '@getlupa/client-sdk/Types'
import type { LupaQueryParamValue, SdkOptions } from '../General'
import type { RoutingBehavior } from '../search-results/RoutingBehavior'
import type { DynamicData } from '../search-results/SearchResultsOptions'
import type { SearchBoxHistory } from './SearchBoxHistory'
import type { SearchBoxPanel } from './SearchBoxPanel'
import { DisplaySuggestion } from './Common'
import { QueryParams } from '../search-results/QueryParams'
import { RedirectionOptions } from '../redirections/RedirectionOptions'
import { DataExtraction } from '../DataExtraction'
import type { MultiCurrencyConfig } from '@/utils/price.utils'

export type SearchBoxOptions = SearchBoxPanelOptions & {
  inputSelector: string
  searchTriggers?: string[]
  searchBoxCloseTriggers?: string[]
  routingBehavior?: RoutingBehavior
  dynamicData?: DynamicData
  callbacks?: SearchBoxEventCallbacks
  redirections?: RedirectionOptions
  queryParameterNames?: Record<LupaQueryParamValue, string>
  keepOpen?: boolean
} & Partial<MultiCurrencyConfig>

export type SearchBoxOptionLabels = {
  placeholder: string
  noResults: string
  moreResults: string
  currency?: string
  currencyTemplate?: string
  priceSeparator?: string
  defaultFacetLabel?: string
  close?: string
  searchInputAriaLabel?: string
  closePanel?: string
}

export type SearchBoxOptionLinks = {
  searchResults: string
}

export type VoiceSearchLabels = {
  listening?: string
  serviceError?: string
  connecting?: string
  microphoneNotFound?: string
  microphoneNotAllowed?: string
  aria?: {
    openDialog?: string
    microphone?: string
  }
}

export type VoiceSearchOptions = {
  enabled: boolean
  queryKey: string
  stopDelay?: number
  timesliceLimit?: number
  timesliceLength?: number
  sampleRate?: number
  labels?: VoiceSearchLabels
  language?: string
  customVoiceServiceUrl?: string
}

export type SearchBoxInputOptions = {
  minInputLength: number
  labels: SearchBoxOptionLabels
  links: SearchBoxOptionLinks
  inputAttributes?: Record<string, string>
  showSubmitButton?: boolean
  voiceSearch?: VoiceSearchOptions
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
  onMounted?: () => unknown
  onFocused?: () => unknown
  onBlurred?: () => unknown
  onClosed?: () => unknown
  onSearchBoxInput?: (input: string) => unknown
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
  hideMoreResultsButtonOnEmptyQuery?: boolean
  showMoreResultsButton?: boolean
  expandOnSinglePanel?: boolean
  forceFullReloadOnParams?: string[]
  initialFilters?: FilterGroup | Record<string, DataExtraction>
}
