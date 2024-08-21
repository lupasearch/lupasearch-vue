import { FilterGroup } from '@getlupa/client-sdk/Types'
import type { SdkOptions } from '../General'
import { SearchResultsProductOptions } from '../search-results/SearchResultsOptions'

export type RecommenderCarouselOptions = {
  itemsToShow?: number
  snapAlign?: string
  scrollPerPage?: number
  breakpoints?: Record<number, RecommenderCarouselOptions>
}

export type ProductRecommendationOptions = SearchResultsProductOptions & {
  options: SdkOptions
} & {
  containerSelector: string
  queryKey: string
  itemId: string[] | string
  abTesting?: RecommendationABTestingOptions
  carousel?: RecommenderCarouselOptions
  recommendationFilters?: FilterGroup
  layoutType?: 'carousel' | 'grid',
  recommendationLabels?: {
    title?: string
  }
}

export type RecommendationABTestingOptions = {
  enabled: boolean
  originalIds?: string[]
  events?: {
    lupaSearchEventName: string
    originalEventName: string
  }
  oldRecommenderDisplayRatio?: number
}
