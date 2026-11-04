export const PARENT_EVENT_NAME = 'GetLupa'

export type AnalyticsEventType =
  | 'search_query'
  | 'search_form_submit'
  | 'autocomplete_suggestion_click'
  | 'autocomplete_product_click'
  | 'search_product_click'
  | 'search_zero_results'
  | 'search_filters'
  | 'search_add_to_cart'
  | 'view_item_list'
  | 'select_item'
  | 'product_recommendation_click'

export type AnalyticsOptions = {
  type: 'ua' | 'ga4' | 'debug'
  enabled: boolean
  parentEventName: string
  ignoreEvents?: AnalyticsEventType[]
  itemMap?: (item: Record<string, unknown>) => Record<string, unknown>
  searchDimensions?: AnalyticsSearchDimensions
}

export type AnalyticsSearchDimensions = {
  enabled?: boolean
  eventName?: string
  attachToEvents?: boolean
  keys?: AnalyticsSearchDimensionKeys
}

export type AnalyticsSearchDimensionKeys = {
  abTestTriggered?: string | false
  abTestVariant?: string | false
  deepSearch?: string | false
}

export type AbTestDecision = {
  abTestTriggered: boolean
  selectedQueryKey?: string
}

export type SearchDimensionValues = {
  abTestTriggered: boolean
  abTestVariant?: string
  deepSearch: boolean
}

export type ProductClickTrackingSettings = {
  eventType?: AnalyticsEventType
  eventLabel?: string
  listLabel?: string
}
