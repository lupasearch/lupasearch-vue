import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import type { SearchQueryResult } from '@getlupa/client-sdk/Types'
import { useTrackingStore } from '../tracking'
import { initTracking } from '@/utils/tracking.utils'
import type { AnalyticsOptions, AnalyticsSearchDimensions } from '@/types/AnalyticsOptions'

vi.mock('@getlupa/client-sdk', () => ({
  default: { track: vi.fn() }
}))

const results = (extra: Record<string, unknown> = {}) =>
  ({ searchText: 'samsung', total: 0, items: [], ...extra }) as unknown as SearchQueryResult

const abTestWithDeepSearch = results({
  abTestDecision: { abTestTriggered: true, selectedQueryKey: 'B' },
  executionMetadata: { deepSearch: { applied: true, filters: {} } }
})

const dimensions = {
  lupa_ab_test_triggered: 'true',
  lupa_ab_test_variant: 'B',
  lupa_deep_search: 'true'
}

const setup = (
  searchDimensions?: AnalyticsSearchDimensions,
  analytics: Partial<AnalyticsOptions> = {},
  trackBase = true
) => {
  initTracking({
    trackBase,
    analytics: {
      type: 'ga4',
      enabled: true,
      parentEventName: '',
      searchDimensions,
      ...analytics
    }
  })
  return useTrackingStore()
}

const trackSearch = (store: ReturnType<typeof useTrackingStore>, res = abTestWithDeepSearch) =>
  store.trackSearchDimensions({ query: { searchText: 'samsung' }, results: res })

describe('tracking store search dimensions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.dataLayer = []
  })

  it('does nothing when searchDimensions is not enabled', () => {
    const store = setup()
    trackSearch(store)
    expect(window.dataLayer).toEqual([])
    expect(store.withSearchDimensions({ a: 1 })).toEqual({ a: 1 })
  })

  it('pushes a separate data layer event after the response', () => {
    const store = setup({ enabled: true })
    trackSearch(store)
    expect(window.dataLayer).toEqual([
      { event: 'lupa_search', search_text: 'samsung', ...dimensions }
    ])
  })

  it('creates the data layer when it is missing', () => {
    window.dataLayer = undefined
    const store = setup({ enabled: true })
    trackSearch(store)
    expect(window.dataLayer).toHaveLength(1)
  })

  it('uses a custom event name', () => {
    const store = setup({ enabled: true, eventName: 'custom_search' })
    trackSearch(store, results())
    expect(window.dataLayer[0].event).toBe('custom_search')
  })

  it('does not push when tracking is disabled', () => {
    const store = setup({ enabled: true }, {}, false)
    trackSearch(store)
    expect(window.dataLayer).toEqual([])
  })

  it('does not push when analytics is disabled', () => {
    const store = setup({ enabled: true }, { enabled: false })
    trackSearch(store)
    expect(window.dataLayer).toEqual([])
    expect(store.withSearchDimensions()).toBeUndefined()
  })

  it('does not push for universal analytics', () => {
    const store = setup({ enabled: true }, { type: 'ua' })
    trackSearch(store)
    expect(window.dataLayer).toEqual([])
    expect(store.withSearchDimensions()).toBeUndefined()
  })

  it('logs the event instead of pushing it in debug mode', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const store = setup({ enabled: true }, { type: 'debug' })
    trackSearch(store)
    expect(window.dataLayer).toEqual([])
    expect(debug).toHaveBeenCalledWith('Analytics debug event:', {
      event: 'lupa_search',
      search_text: 'samsung',
      ...dimensions
    })
    debug.mockRestore()
  })

  it('adds the last search dimensions to following events', () => {
    const store = setup({ enabled: true })
    trackSearch(store)
    expect(store.withSearchDimensions({ a: 1 })).toEqual({ a: 1, ...dimensions })

    store.trackResults({ queryKey: 'key', results: abTestWithDeepSearch })
    expect(window.dataLayer[1]).toMatchObject({ event: 'search_zero_results', ...dimensions })
  })

  it('does not add dimensions to following events with attachToEvents false', () => {
    const store = setup({ enabled: true, attachToEvents: false })
    trackSearch(store)
    expect(window.dataLayer).toHaveLength(1)
    expect(store.withSearchDimensions()).toBeUndefined()
  })
})
