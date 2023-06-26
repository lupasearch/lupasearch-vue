import type { SdkOptions } from '../General'
import type { SearchResultsProductCardOptions } from '../search-results/SearchResultsProductCardOptions'

export type RecommenderCarouselOptions = {
  itemsToShow?: number
  snapAlign?: string
  scrollPerPage?: number
  breakpoints?: Record<number, RecommenderCarouselOptions>
}

export type ProductRecommendationOptions = SearchResultsProductCardOptions & {
  options: SdkOptions
} & {
  containerSelector: string
  queryKey: string
  itemId: string
  abTesting?: RecommendationABTestingOptions
  carousel?: RecommenderCarouselOptions
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
