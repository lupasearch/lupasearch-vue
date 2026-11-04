import { describe, expect, it } from 'vitest'
import type { SearchQueryResult } from '@getlupa/client-sdk/Types'
import {
  getSearchDimensionParams,
  getSearchDimensionValues,
  resolveSearchDimensionsOptions
} from '../searchDimensions.utils'

const response = (extra: Record<string, unknown> = {}) =>
  ({
    searchText: 'pigiausias samsung šaldytuvas',
    total: 10,
    items: [],
    ...extra
  }) as unknown as SearchQueryResult

const abTest = (selectedQueryKey: string) => ({
  abTestDecision: { abTestTriggered: true, selectedQueryKey }
})

const appliedDeepSearch = (applied: boolean) => ({
  executionMetadata: { deepSearch: { status: 'success', applied, cached: false, filters: {} } }
})

describe('getSearchDimensionValues', () => {
  it('case 1: A/B test not triggered', () => {
    expect(getSearchDimensionValues({}, response())).toEqual({
      abTestTriggered: false,
      abTestVariant: undefined,
      deepSearch: false
    })
  })

  it('case 1: deep search applied without the A/B test', () => {
    expect(getSearchDimensionValues({}, response(appliedDeepSearch(true)))).toEqual({
      abTestTriggered: false,
      abTestVariant: undefined,
      deepSearch: true
    })
  })

  it('case 2: A/B test triggered, with deep search', () => {
    expect(
      getSearchDimensionValues({}, response({ ...abTest('B'), ...appliedDeepSearch(true) }))
    ).toEqual({ abTestTriggered: true, abTestVariant: 'B', deepSearch: true })
  })

  it('case 2: later request keeps the deep search result with adjustedSearchText and filters', () => {
    expect(
      getSearchDimensionValues(
        { adjustedSearchText: '', filters: { categories: ['Šaldytuvai'] } },
        response(abTest('B'))
      )
    ).toEqual({ abTestTriggered: true, abTestVariant: 'B', deepSearch: true })
  })

  it('case 2: adjustedSearchText without filters (clear all) is not deep search', () => {
    expect(
      getSearchDimensionValues(
        { adjustedSearchText: '', filters: { categories: [] } },
        response(abTest('B'))
      )
    ).toEqual({ abTestTriggered: true, abTestVariant: 'B', deepSearch: false })
  })

  it('filters without adjustedSearchText are not deep search', () => {
    expect(
      getSearchDimensionValues({ filters: { brand: ['Samsung'] } }, response()).deepSearch
    ).toBe(false)
  })

  it('case 3a: assigned to the variant without deep search', () => {
    expect(getSearchDimensionValues({}, response(abTest('C')))).toEqual({
      abTestTriggered: true,
      abTestVariant: 'C',
      deepSearch: false
    })
  })

  it('case 3b: deep search ran but was not applied', () => {
    expect(
      getSearchDimensionValues({}, response({ ...abTest('B'), ...appliedDeepSearch(false) }))
    ).toEqual({ abTestTriggered: true, abTestVariant: 'B', deepSearch: false })
  })
})

describe('getSearchDimensionParams', () => {
  it('uses default keys and string values', () => {
    expect(
      getSearchDimensionParams({ abTestTriggered: true, abTestVariant: 'B', deepSearch: false })
    ).toEqual({
      lupa_ab_test_triggered: 'true',
      lupa_ab_test_variant: 'B',
      lupa_deep_search: 'false'
    })
  })

  it('sends an empty variant when the A/B test was not triggered', () => {
    expect(
      getSearchDimensionParams({ abTestTriggered: false, deepSearch: false }).lupa_ab_test_variant
    ).toBe('')
  })

  it('renames keys and skips keys set to false', () => {
    expect(
      getSearchDimensionParams(
        { abTestTriggered: true, abTestVariant: 'B', deepSearch: true },
        { keys: { abTestTriggered: 'ab', abTestVariant: false } }
      )
    ).toEqual({ ab: 'true', lupa_deep_search: 'true' })
  })
})

describe('resolveSearchDimensionsOptions', () => {
  it('is disabled by default', () => {
    expect(resolveSearchDimensionsOptions()).toEqual({
      enabled: false,
      eventName: 'lupa_search',
      attachToEvents: true,
      keys: {
        abTestTriggered: 'lupa_ab_test_triggered',
        abTestVariant: 'lupa_ab_test_variant',
        deepSearch: 'lupa_deep_search'
      }
    })
  })

  it('keeps defaults for options set to undefined', () => {
    const options = resolveSearchDimensionsOptions({
      enabled: true,
      eventName: undefined,
      attachToEvents: undefined
    })
    expect(options.eventName).toBe('lupa_search')
    expect(options.attachToEvents).toBe(true)
  })
})
