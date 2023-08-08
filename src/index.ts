import { Pinia, createPinia } from 'pinia'
import { initTracking } from './utils/tracking.utils'
import { useOptionsStore } from './stores/options'
import type { Environment, SdkOptions, SortDirection, TrackingOptions } from './types/General'
import { DocumentElementType } from './types/DocumentElement'
import type {
  DocumentElement,
  ImageDocumentElement,
  TitleDocumentElement,
  DescriptionDocumentElement,
  CustomDocumentElement,
  PriceElement,
  RegularPriceDocumentElement,
  RatingElement,
  AddToCartElement,
  CustomHtmlElement,
  SingleStarRatingElement
} from './types/DocumentElement'
import type {
  ProductListOptions,
  CategoryFilterOptions
} from './types/product-list/ProductListOptions'
import type {
  ProductRecommendationOptions,
  RecommendationABTestingOptions
} from './types/recommendations/RecommendationsOptions'
import type { SearchBoxOptions } from './types/search-box/SearchBoxOptions'
import { SearchBoxPanelType } from './types/search-box/SearchBoxPanel'
import type {
  SearchContainerOptions,
  SearchContainerConfigOptions
} from './types/search-container/SearchContainerOptions'
import type {
  SearchResultBadgeType,
  SearchResultBadgeElement,
  BadgeGenerateSeed,
  BadgeGenerateOptions,
  BadgeOptions,
  BadgeType
} from './types/search-results/BadgeOptions'
import type { RoutingBehavior } from './types/search-results/RoutingBehavior'
import type {
  SearchResultsOptions,
  FacetStyle,
  SearchResultEventCallbacks,
  CallbackContext,
  FacetFilterQuery,
  SearchResultsFilterOptions,
  ResultFacetOptions,
  DynamicData,
  SsrOptions
} from './types/search-results/SearchResultsOptions'
import type { AnchorPosition } from './types/search-results/SearchResultsProductCardOptions'
import type {
  SortOptions,
  SearchResultsSortOptions
} from './types/search-results/SearchResultsSort'

import SearchBox from './components/search-box/SearchBox.vue'
import SearchResults from './components/search-results/SearchResults.vue'
import ProductList from './components/product-list/ProductList.vue'
import SearchContainer from './components/search-container/SearchContainer.vue'
import Recommendations from './components/recommendations/Recommendations.vue'
import { getInitialSearchResults } from './utils/ssr.utils'

let piniaInstance: Pinia | null = null

const initPinia = () => {
  if (piniaInstance) {
    return piniaInstance
  }
  const pinia = createPinia()
  piniaInstance = pinia
  return pinia
}

const setupTracking = (options: TrackingOptions): void => {
  const pinia = initPinia()
  const store = useOptionsStore(pinia)
  initTracking(options)
  store.setTrackingOptions({ options })
}

const LupaSearch = {
  install: (app, options) => {
    const pinia = createPinia()
    app.use(pinia)
  }
}

export {
  SearchBox,
  SearchResults,
  ProductList,
  Recommendations,
  SearchContainer,
  DocumentElementType,
  SearchBoxPanelType,
  BadgeType,
  setupTracking,
  LupaSearch,
  initPinia,
  getInitialSearchResults
}

export type {
  TrackingOptions,
  SearchBoxOptions,
  SearchResultsOptions,
  ProductListOptions,
  SdkOptions,
  FacetStyle,
  Environment,
  RoutingBehavior,
  AnchorPosition,
  SortDirection,
  DocumentElement,
  ImageDocumentElement,
  TitleDocumentElement,
  DescriptionDocumentElement,
  CustomDocumentElement,
  PriceElement,
  RegularPriceDocumentElement,
  RatingElement,
  AddToCartElement,
  CustomHtmlElement,
  SortOptions,
  SearchResultsSortOptions,
  SearchResultEventCallbacks,
  CallbackContext,
  FacetFilterQuery,
  CategoryFilterOptions,
  SearchResultsFilterOptions,
  SearchResultBadgeType,
  SearchResultBadgeElement,
  ResultFacetOptions,
  BadgeGenerateSeed,
  BadgeGenerateOptions,
  BadgeOptions,
  SearchContainerOptions,
  SearchContainerConfigOptions,
  SingleStarRatingElement,
  DynamicData,
  ProductRecommendationOptions,
  RecommendationABTestingOptions,
  SsrOptions
}
