import type { SearchResultsProductCardOptions } from './SearchResultsProductCardOptions'

/**
 * - `regular`: AI search runs inside the main results query. A panel above results shows the
 *   explanation and lets the shopper drop AI filters/sort.
 * - `bestProducts`: AI products are loaded by a separate query (`modifiers.aiSearch: true`) and shown
 *   in a panel above results. The main query sends `modifiers.aiSearch: false`.
 * - `clickToTrigger`: same as `bestProducts`, but loading starts only when the shopper clicks the panel.
 */
export type AiSearchMode = 'regular' | 'bestProducts' | 'clickToTrigger'

/** How the AI search loader is shown when precheck returns `assisted: true` */
export type AiSearchLoaderType = 'dialog' | 'panel'

export type AiSearchOptions = {
  enabled?: boolean
  mode?: AiSearchMode
  regular?: AiSearchRegularOptions
  /** Used by both `bestProducts` and `clickToTrigger` modes */
  bestProducts?: AiSearchBestProductsOptions
}

export type AiSearchRegularOptions = {
  /** Send a parallel request to `/query/{queryKey}/precheck` and show the AI loader if `assisted: true` */
  precheck?: boolean
  /** Default `dialog` */
  loader?: AiSearchLoaderType
  showExplanation?: boolean
  labels?: AiSearchRegularLabels
}

export type AiSearchRegularLabels = {
  /** Shown while loading when precheck returned `assisted: true` */
  loading?: string
  /**
   * Panel text when there is no `explanation`: AI search returned none, or the result was restored
   * from the URL (`adj` param present, so AI search did not run again)
   */
  explanationFallback?: string
  /** Clears all filters and sort, keeps `adjustedSearchText`, e.g. "Show all results" */
  clear?: string
}

export type AiSearchBestProductsOptions = {
  /** Query key for the AI products request. Defaults to the main results query key */
  queryKey?: string
  /** Number of AI products to request (sent as `limit`). Default 3 */
  limit?: number
  /** Show product cards. Set to `false` to show only explanation and suggested filters. Default true */
  showProducts?: boolean
  showExplanation?: boolean
  showSuggestedFilters?: boolean
  /** Card overrides. Anything not set falls back to the main search results card options */
  productCard?: Partial<Omit<SearchResultsProductCardOptions, 'labels' | 'queryKey'>>
  labels?: AiSearchBestProductsLabels
}

export type AiSearchBestProductsLabels = {
  /** Panel title, e.g. "Best matches for your search" */
  title?: string
  loading?: string
  /** Text on the panel before the first load, `clickToTrigger` mode only */
  trigger?: string
  explanationFallback?: string
  suggestedFiltersTitle?: string
  /** Applies suggested filters and sort to the main results. Shown only after AI products load */
  applyFilters?: string
  /** Toggle that shows collapsed products. Products collapse when suggestions are applied */
  expandProducts?: string
  /** Toggle that hides products */
  collapseProducts?: string
}
