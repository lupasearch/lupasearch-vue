import type { SearchResultsProductCardOptions } from './SearchResultsProductCardOptions'

/**
 * - `regular`: deep search runs inside the main results query. A panel above results shows the
 *   explanation and lets the shopper drop deep search filters/sort.
 * - `bestProducts`: deep search products are loaded by a separate query (`modifiers.deepSearch: true`) and shown
 *   in a panel above results. The main query sends `modifiers.deepSearch: false`.
 * - `clickToTrigger`: same as `bestProducts`, but loading starts only when the shopper clicks the panel.
 */
export type DeepSearchMode = 'regular' | 'bestProducts' | 'clickToTrigger'

/** How the deep search loader is shown when precheck returns `assisted: true` */
export type DeepSearchLoaderType = 'dialog' | 'panel'

export type DeepSearchOptions = {
  enabled?: boolean
  mode?: DeepSearchMode
  regular?: DeepSearchRegularOptions
  /** Used by both `bestProducts` and `clickToTrigger` modes */
  bestProducts?: DeepSearchBestProductsOptions
}

export type DeepSearchRegularOptions = {
  /** Send a parallel request to `/query/{queryKey}/precheck` and show the deep search loader if `assisted: true` */
  precheck?: boolean
  /** Default `dialog` */
  loader?: DeepSearchLoaderType
  showExplanation?: boolean
  labels?: DeepSearchRegularLabels
}

export type DeepSearchRegularLabels = {
  /** Shown while loading when precheck returned `assisted: true` */
  loading?: string
  /**
   * Panel text when there is no `explanation`: deep search returned none, or the result was restored
   * from the URL (`adj` param present, so deep search did not run again)
   */
  explanationFallback?: string
  /** Clears all filters and sort, keeps `adjustedSearchText`, e.g. "Show all results" */
  clear?: string
}

export type DeepSearchBestProductsOptions = {
  /** Query key for the deep search products request. Defaults to the main results query key */
  queryKey?: string
  /** Number of deep search products to request (sent as `limit`). Default 3 */
  limit?: number
  /** Show product cards. Set to `false` to show only explanation and suggested filters. Default true */
  showProducts?: boolean
  showExplanation?: boolean
  showSuggestedFilters?: boolean
  /** Card overrides. Anything not set falls back to the main search results card options */
  productCard?: Partial<Omit<SearchResultsProductCardOptions, 'labels' | 'queryKey'>>
  labels?: DeepSearchBestProductsLabels
}

export type DeepSearchBestProductsLabels = {
  /** Panel title, e.g. "Best matches from deep search" */
  title?: string
  loading?: string
  /** Text on the panel before the first load, `clickToTrigger` mode only */
  trigger?: string
  explanationFallback?: string
  suggestedFiltersTitle?: string
  /** Applies suggested filters and sort to the main results. Shown only after deep search products load */
  applyFilters?: string
  /** Toggle that shows collapsed products. Products collapse when suggestions are applied */
  expandProducts?: string
  collapseProducts?: string
}
