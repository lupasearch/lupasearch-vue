import type { AnalyticsEventType } from '@/types/AnalyticsOptions'
import type { TrackableEventData } from '@/types/search-box/Common'
import { track } from '@/utils/tracking.utils'
import type { Options, PublicQuery, SearchQueryResult } from '@getlupa/client-sdk/Types'
import { defineStore } from 'pinia'
import { useOptionsStore } from './options'
import type { TrackingOptions } from '@/types/General'

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
        analytics: data.analytics ? { ...data.analytics, items: mappedItems } : undefined
      },
      options
    )
  }

  return { trackSearch, trackResults, trackEvent }
})
