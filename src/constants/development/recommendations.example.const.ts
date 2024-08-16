import { ProductRecommendationOptions } from '@/types/recommendations/RecommendationsOptions'
import { SEARCH_RESULTS_CONFIGURATION } from './searchResultsDev.const'

export const RECOMMENDATIONS_OPTIONS: ProductRecommendationOptions = {
  ...SEARCH_RESULTS_CONFIGURATION,
  containerSelector: '',
  queryKey: 'jnovl7k0kkvd',
  itemId: '1',
  abTesting: {
    enabled: false
  },
  recommendationLabels: {
    title: 'Similar products'
  },
  carousel: {
    scrollPerPage: 4,
    itemsToShow: 8,
    breakpoints: {
      768: {
        itemsToShow: 4
      },
      1024: {
        itemsToShow: 5
      }
    }
  }
}
