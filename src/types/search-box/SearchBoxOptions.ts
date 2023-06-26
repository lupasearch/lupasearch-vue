import type { SdkOptions } from '../General'
import type { RoutingBehavior } from '../search-results/RoutingBehavior'
import type { DynamicData } from '../search-results/SearchResultsOptions'
import type { SearchBoxHistory } from './SearchBoxHistory'
import type { SearchBoxPanel } from './SearchBoxPanel'

export type SearchBoxOptions = SearchBoxPanelOptions & {
  inputSelector: string
  searchTriggers?: string[]
  routingBehavior?: RoutingBehavior
  dynamicData?: DynamicData
}

export type SearchBoxOptionLabels = {
  placeholder: string
  noResults: string
  moreResults: string
  currency: string
  priceSeparator?: string
  defaultFacetLabel?: string
  close?: string
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

export type SearchBoxPanelOptions = SearchBoxInputOptions & {
  history: SearchBoxHistory
  panels: SearchBoxPanel[]
  options: SdkOptions
  debounce?: number
  showTotalCount?: boolean
}
