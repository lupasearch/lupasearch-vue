import type { AnalyticsEventType } from '@/types/AnalyticsOptions'
import type { TrackableEventData } from '@/types/search-box/Common'
import {
  getDelayedEventsCache,
  getSearchDimensionsOptions,
  pushDataLayerEvent,
  storeDelayedEventCache,
  track
} from '@/utils/tracking.utils'
import {
  getSearchDimensionParams,
  getSearchDimensionValues,
  resolveSearchDimensionsOptions
} from '@/utils/searchDimensions.utils'
import type { Options, PublicQuery, SearchQueryResult } from '@getlupa/client-sdk/Types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useOptionsStore } from './options'
import type { TrackingOptions } from '@/types/General'
import { useSearchResultStore } from './searchResult'

const getSearchTrackingData = (
  searchText: string,
  type: AnalyticsEventType
): TrackableEventData => {
  return {
    searchQuery: searchText,
    analytics: {
      type: type,
      label: searchText
    }
  }
}

export const useTrackingStore = defineStore('tracking', () => {
  const optionsStore = useOptionsStore()
  const searchResultStore = useSearchResultStore()

  /** Analytics dimensions of the last main search results response, added to the events that follow it */
  const searchDimensionParams = ref<Record<string, string> | undefined>(undefined)

  const withSearchDimensions = (
    params?: Record<string, unknown>
  ): Record<string, unknown> | undefined => {
    return searchDimensionParams.value ? { ...params, ...searchDimensionParams.value } : params
  }

  /** Configured in `tracking.analytics.searchDimensions`, read from the stored analytics options */
  const trackSearchDimensions = ({
    query,
    results
  }: {
    query: PublicQuery
    results: SearchQueryResult
  }) => {
    const options = getSearchDimensionsOptions()
    if (!options) {
      searchDimensionParams.value = undefined
      return
    }
    const resolvedOptions = resolveSearchDimensionsOptions(options)
    const params = getSearchDimensionParams(
      getSearchDimensionValues(query, results),
      resolvedOptions
    )
    searchDimensionParams.value = resolvedOptions.attachToEvents ? params : undefined
    pushDataLayerEvent(resolvedOptions.eventName, { search_text: results.searchText, ...params })
  }

  const trackSearch = ({
    queryKey,
    query,
    type = 'search_query'
  }: {
    queryKey: string
    query: PublicQuery
    type?: AnalyticsEventType
  }) => {
    const options: Options = optionsStore.envOptions ?? { environment: 'production' }
    const hasFilters = Object.keys(query.filters ?? {}).length > 0
    if (hasFilters) {
      const data = getSearchTrackingData(query.searchText, 'search_filters')
      track(queryKey, data, options)
      return
    }
    const data = getSearchTrackingData(query.searchText, type)
    track(queryKey, data, options)
  }

  const trackResults = ({
    queryKey,
    results
  }: {
    queryKey: string
    results: SearchQueryResult
  }) => {
    const options: Options = optionsStore.envOptions ?? { environment: 'production' }
    if (results.total > 0) {
      return
    }
    const data = getSearchTrackingData(results.searchText, 'search_zero_results')
    if (data.analytics) {
      data.analytics.additionalParams = withSearchDimensions()
    }
    track(queryKey, data, options)
  }

  const trackEvent = ({ queryKey, data }: { queryKey: string; data: TrackableEventData }) => {
    const options: Options = optionsStore.envOptions ?? { environment: 'production' }
    const trackingOptions: TrackingOptions = optionsStore.trackingOptions ?? {}
    const items = data.analytics?.items ?? []
    const mappedItems = trackingOptions.analytics?.itemMap
      ? items.map(trackingOptions.analytics.itemMap)
      : items
    track(
      queryKey,
      {
        ...data,
        analytics: data.analytics ? { ...data.analytics, items: mappedItems } : undefined,
        filters: searchResultStore.hasAnyFilter ? searchResultStore.filters : undefined
      },
      options
    )
  }

  const trackDelayedEvent = ({
    queryKey,
    data,
    url
  }: {
    queryKey: string
    data: TrackableEventData
    url: string
  }) => {
    let currentCache = getDelayedEventsCache()
    currentCache = {
      ...currentCache,
      [url]: { data, queryKey }
    }
    storeDelayedEventCache(currentCache)
  }

  return {
    searchDimensionParams,
    trackSearch,
    trackResults,
    trackSearchDimensions,
    withSearchDimensions,
    trackEvent,
    trackDelayedEvent
  }
})
