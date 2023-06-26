import { createPinia } from 'pinia'
import { initTracking } from './utils/tracking.utils'
import { useOptionsStore } from './stores/options'
import type { Environment, SdkOptions, SortDirection, TrackingOptions } from './types/General'
import type {
  DocumentElementType,
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
import type { SearchBoxPanelType } from './types/search-box/SearchBoxPanel'
import type {
  SearchContainerOptions,
  SearchContainerConfigOptions
} from './types/search-container/SearchContainerOptions'
import type {
  BadgeType,
  SearchResultBadgeType,
  SearchResultBadgeElement,
  BadgeGenerateSeed,
  BadgeGenerateOptions,
  BadgeOptions
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
  DynamicData
} from './types/search-results/SearchResultsOptions'
import type { AnchorPosition } from './types/search-results/SearchResultsProductCardOptions'
import type {
  SortOptions,
  SearchResultsSortOptions
} from './types/search-results/SearchResultsSort'
import { createApp, type Component, type ComponentPublicInstance, reactive } from 'vue'
import SearchBoxEntry from './SearchBoxEntry.vue'
import SearchResultsEntry from './SearchResultsEntry.vue'
import ProductListEntry from './ProductListEntry.vue'
import SearchContainerEntry from './SearchContainerEntry.vue'
import RecommendationsEntry from './RecommendationsEntry.vue'
import { DEFAULT_CONTAINER_STYLE } from './constants/global.const'
import { attatchShadowDom, createShadowDom } from './utils/shadowDom.utils'

import SearchBox from './components/search-box/SearchBox.vue'
import SearchResults from './components/search-results/SearchResults.vue'
import ProductList from './components/product-list/ProductList.vue'
import Recommendations from './components/recommendations/Recommendations.vue'

type AppInstance = Record<string, Partial<ComponentPublicInstance> | null>

type AppInstances = Record<
  'box' | 'results' | 'productList' | 'searchContainer' | 'recommendations',
  AppInstance
>

type MountOptions = { fetch: boolean }

const app: AppInstances = {
  box: {},
  results: {},
  productList: {},
  searchContainer: {},
  recommendations: {}
}

const tracking = (options: TrackingOptions): void => {
  const pinia = createPinia()
  const store = useOptionsStore(pinia)
  initTracking(options)
  store.setTrackingOptions({ options })
}

const createVue = (
  selector: string | Element,
  rootComponent: Component,
  options: Record<string, unknown>
) => {
  const pinia = createPinia()
  const element = typeof selector === 'string' ? document.querySelector(selector) : selector
  if (!element) {
    console.error(`Cannot mount LupaSearch componbent. Element "${selector}" not found`)
    return
  }
  const props = reactive({ ...options })
  const app = createApp(rootComponent, props)
  app.use(pinia)
  const mountedApp = app.mount(element)
  return mountedApp
}

const applySearchBox = (options: SearchBoxOptions, mountOptions?: MountOptions): void => {
  const existingInstance = app.box[options.inputSelector] as any
  if (existingInstance) {
    existingInstance.searchBoxOptions = options
    if (mountOptions?.fetch) {
      setTimeout(() => {
        existingInstance.fetch?.()
      })
    }
    return
  }
  const instance = createVue(options.inputSelector, SearchBoxEntry, { searchBoxOptions: options })
  if (!instance) {
    return
  }
  app.box[options.inputSelector] = instance
}

const searchBox = (options: SearchBoxOptions, mountOptions?: MountOptions): void => {
  // Support for multiple search box selectors separated by a comma
  // Quite often multiple search boxes are required, since mobile and desktop has different inputs in html layout
  const inputs = options.inputSelector?.split(',')
  for (const input of inputs) {
    applySearchBox({ ...options, inputSelector: input.trim() }, mountOptions)
  }
}

const searchResults = (options: SearchResultsOptions, mountOptions?: MountOptions): void => {
  const existingInstance = app.results[options.containerSelector] as any
  if (existingInstance) {
    existingInstance.searchResultsOptions = options
    if (mountOptions?.fetch) {
      setTimeout(() => {
        existingInstance.fetch?.()
      })
    }
    return
  }
  const instance = createVue(options.containerSelector, SearchResultsEntry, {
    searchResultsOptions: options
  })
  if (!instance) {
    return
  }
  app.results[options.containerSelector] = instance
}

const productList = (options: ProductListOptions, mountOptions?: MountOptions): void => {
  const existingInstance = app.productList[options.containerSelector] as any
  if (existingInstance) {
    existingInstance.productListOptions = options
    if (mountOptions?.fetch) {
      setTimeout(() => {
        existingInstance.fetch?.()
      })
    }
    return
  }
  const instance = createVue(options.containerSelector, ProductListEntry, {
    productsListOptions: options
  })
  if (!instance) {
    return
  }
  app.productList[options.containerSelector] = instance
}

const searchContainer = (options: SearchContainerOptions, mountOptions?: MountOptions): void => {
  const existingInstance = app.searchContainer[options.trigger] as any
  console.log(existingInstance)
  if (existingInstance) {
    existingInstance.searchContainerOptions.value = options
    existingInstance.reloadOptions()
    console.log(existingInstance)
    if (mountOptions?.fetch) {
      setTimeout(() => {
        existingInstance.fetch?.()
      })
    }
    return
  }
  const id = 'lupa-search-container-manager'
  const shadowId = 'lupa-shadow-id'
  const { host, manager } = createShadowDom(shadowId, id)
  attatchShadowDom({
    host,
    manager,
    styleUrl: options.options?.styleLink ?? DEFAULT_CONTAINER_STYLE,
    options: options.options
  })
  document.body.appendChild(host)
  const instance = createVue(manager, SearchContainerEntry, {
    searchContainerOptions: options
  })
  if (!instance) {
    return
  }
  app.searchContainer[options.trigger] = instance
}

const recommendations = (
  options: ProductRecommendationOptions,
  mountOptions?: MountOptions
): void => {
  const existingInstance = app.recommendations[options.containerSelector] as any
  if (existingInstance) {
    existingInstance.recommendationOptions = options
    if (mountOptions?.fetch) {
      setTimeout(() => {
        existingInstance.fetch?.()
      })
    }
    return
  }

  const instance = createVue(options.containerSelector, RecommendationsEntry, {
    recommendationOptions: options
  })
  if (!instance) {
    return
  }

  app.recommendations[options.containerSelector] = instance
}

const clearInstance = (selector: string) => {
  const element = document.querySelector(selector)
  if (!element) {
    return
  }
  document.body.removeChild(element)
}

const clearSearchBox = (selector?: string): void => {
  try {
    if (selector) {
      app.box[selector] = null
      clearInstance(selector)
    }
    for (const key in app.box) {
      clearInstance(key)
    }
    app.box = {}
  } catch {
    // do nothing, already destroyed;
  }
}

const clearSearchResults = (selector?: string): void => {
  try {
    if (selector) {
      app.results[selector] = null
      clearInstance(selector)
    }
    for (const key in app.results) {
      clearInstance(key)
    }
    app.results = {}
  } catch {
    // do nothing, already destroyed;
  }
}

const clearProductList = (selector?: string): void => {
  try {
    if (selector) {
      app.productList[selector] = null
      clearInstance(selector)
    }
    for (const key in app.productList) {
      clearInstance(key)
    }
    app.productList = {}
  } catch {
    // do nothing, already destroyed;
  }
}

const clearSearchContainer = (selector?: string): void => {
  try {
    if (selector) {
      app.searchContainer[selector] = null
      clearInstance(selector)
    }
    for (const key in app.searchContainer) {
      clearInstance(key)
    }
    app.searchContainer = {}
  } catch {
    // do nothing, already destroyed;
  }
}

const clearRecommendations = (selector?: string): void => {
  try {
    if (selector) {
      app.recommendations[selector] = null
      clearInstance(selector)
    }
    for (const key in app.recommendations) {
      clearInstance(key)
    }
    app.recommendations = {}
  } catch {
    // do nothing, already destroyed;
  }
}

const lupaSearch = {
  searchBox,
  searchResults,
  tracking,
  productList,
  searchContainer,
  recommendations,
  clearSearchBox,
  clearSearchResults,
  clearProductList,
  clearSearchContainer,
  clearRecommendations
}

export { SearchBox, SearchResults, ProductList, Recommendations }

export type {
  TrackingOptions,
  SearchBoxOptions,
  SearchResultsOptions,
  ProductListOptions,
  SdkOptions,
  DocumentElementType,
  SearchBoxPanelType,
  FacetStyle,
  Environment,
  RoutingBehavior,
  AnchorPosition,
  BadgeType,
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
  MountOptions,
  SearchContainerOptions,
  SearchContainerConfigOptions,
  SingleStarRatingElement,
  DynamicData,
  ProductRecommendationOptions,
  RecommendationABTestingOptions
}

export default lupaSearch
