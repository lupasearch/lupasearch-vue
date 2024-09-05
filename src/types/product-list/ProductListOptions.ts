import type { FilterGroup } from '@getlupa/client-sdk/Types'
import type { RoutingBehavior } from '../search-results/RoutingBehavior'
import type { SearchResultsOptions } from '../search-results/SearchResultsOptions'
import { DataExtraction } from '../DataExtraction'

export type CategoryFilterOptions = {
  queryKey?: string
  routingBehavior?: RoutingBehavior
  keys: {
    titleKey?: string
    urlKey?: string
  }
  filters?: Record<string, string[]>
  back?: {
    url: string
    title: string
  }
  parent?: {
    url?: string
    title?: string
  }
  current?: {
    title?: string
    description?: string
    descriptionTop?: string
  }
}

export type ProductListOptions = SearchResultsOptions & {
  initialFilters?: FilterGroup | Record<string, DataExtraction>
  categories?: CategoryFilterOptions
}
