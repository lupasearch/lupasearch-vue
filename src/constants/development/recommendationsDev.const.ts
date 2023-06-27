import { ProductRecommendationOptions } from '@getlupa/vue'
import { SEARCH_RESULTS_CONFIGURATION } from './searchResultsDev.const'

export const RECOMMENDATIONS_OPTIONS: ProductRecommendationOptions = {
  ...SEARCH_RESULTS_CONFIGURATION,
  containerSelector: '',
  queryKey: 'jnovl7k0kkvd',
  itemId: '2',
  abTesting: {
    enabled: true,
    originalIds: ['2', '4', '8'],
    oldRecommenderDisplayRatio: 0
  },
  carousel: {
    scrollPerPage: 1,
    itemsToShow: 2,
    snapAlign: 'center',
    breakpoints: {
      768: {
        itemsToShow: 3,
        scrollPerPage: 1
      },
      1024: {
        itemsToShow: 5,
        scrollPerPage: 1
      }
    }
  }
}
