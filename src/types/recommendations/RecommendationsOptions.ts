import type { FilterGroup, Document } from '@getlupa/client-sdk/Types'
import type { SdkOptions } from '../General'
import { SearchResultsProductOptions } from '../search-results/SearchResultsOptions'
import { DataExtraction } from '../DataExtraction'

export type RecommenderCarouselOptions = {
  itemsToShow?: number
  snapAlign?: string
  scrollPerPage?: number
  breakpoints?: Record<number, RecommenderCarouselOptions>
}

export type RecommendationCallbacks = {
  onRecommenderResults?: (results: Document[]) => unknown
  onMounted?: () => unknown
}

export type ProductRecommendationOptions = SearchResultsProductOptions & {
  options: SdkOptions
} & {
  containerSelector: string
  queryKey: string
  lazyLoad?: boolean
  itemId: DataExtraction | (string[] | string)
  abTesting?: RecommendationABTestingOptions
  carousel?: RecommenderCarouselOptions
  recommendationFilters?: FilterGroup | Record<string, DataExtraction | (string[] | string)>
  layoutType?: 'carousel' | 'grid'
  recommendationLabels?: {
    title?: string
  }
  recommendationCallbacks?: RecommendationCallbacks
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
