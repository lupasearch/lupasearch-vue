import { describe, expect, it } from 'vitest'
import {
  areDeepSearchFiltersApplied,
  getDeepSearchFilterParams,
  withDeepSearchMetadata,
  withDeepSearchModifier
} from '../deepSearch.utils'

describe('getDeepSearchFilterParams', () => {
  it('should return no params without filters', () => {
    expect(getDeepSearchFilterParams(undefined)).toEqual([])
    expect(getDeepSearchFilterParams({})).toEqual([])
  })

  it('should create term params', () => {
    expect(getDeepSearchFilterParams({ brand: ['Samsung'], categories: ['Šaldytuvai'] })).toEqual([
      { name: 'f.brand', value: ['Samsung'] },
      { name: 'f.categories', value: ['Šaldytuvai'] }
    ])
  })

  it('should merge term values with current filters', () => {
    expect(
      getDeepSearchFilterParams({ brand: ['Samsung', 'LG'] }, { brand: ['LG', 'Bosch'] })
    ).toEqual([{ name: 'f.brand', value: ['LG', 'Bosch', 'Samsung'] }])
  })

  it('should stringify non-string term values', () => {
    expect(getDeepSearchFilterParams({ in_stock: [true, 1] as unknown as string[] })).toEqual([
      { name: 'f.in_stock', value: ['true', '1'] }
    ])
  })

  it('should create range params', () => {
    expect(getDeepSearchFilterParams({ price: { gte: 100, lte: 500 } })).toEqual([
      { name: 'fr.price', value: '100:500' }
    ])
  })

  it('should create open range params', () => {
    expect(getDeepSearchFilterParams({ price: { lte: 500 } })).toEqual([
      { name: 'fr.price', value: ':500' }
    ])
    expect(getDeepSearchFilterParams({ price: { gt: 100 } })).toEqual([
      { name: 'fr.price', value: '100:' }
    ])
  })

  it('should create partial range params for exclusive upper bound', () => {
    expect(getDeepSearchFilterParams({ price: { gte: 100, lt: 500 } })).toEqual([
      { name: 'fpr.price', value: '100:500' }
    ])
  })

  it('should skip empty range', () => {
    expect(getDeepSearchFilterParams({ price: {} })).toEqual([])
  })

  it('should create hierarchy params merged with current filters', () => {
    expect(
      getDeepSearchFilterParams(
        { category: { level: 1, terms: ['Appliances > Fridges'] } },
        { category: { level: 0, terms: ['Electronics'] } }
      )
    ).toEqual([{ name: 'fh.category', value: ['Electronics', 'Appliances > Fridges'] }])
  })
})

describe('withDeepSearchModifier', () => {
  it('should return modifiers unchanged when deepSearch is not set', () => {
    expect(withDeepSearchModifier(undefined)).toBeUndefined()
    expect(withDeepSearchModifier({ facets: true, refiners: false })).toEqual({
      facets: true,
      refiners: false
    })
  })

  it('should add deepSearch modifier', () => {
    expect(withDeepSearchModifier(undefined, true)).toEqual({ deepSearch: true })
    expect(withDeepSearchModifier(undefined, false)).toEqual({ deepSearch: false })
  })

  it('should combine with other modifiers', () => {
    expect(withDeepSearchModifier({ facets: false, refiners: true }, true)).toEqual({
      facets: false,
      refiners: true,
      deepSearch: true
    })
  })

  it('should not mutate passed modifiers', () => {
    const modifiers = { facets: true }
    withDeepSearchModifier(modifiers, true)
    expect(modifiers).toEqual({ facets: true })
  })
})

describe('withDeepSearchMetadata', () => {
  it('should return metadata unchanged for regular results', () => {
    expect(withDeepSearchMetadata(undefined, false)).toBeUndefined()
    expect(withDeepSearchMetadata({ _lupaEventSource: 'didYouMean' }, false)).toEqual({
      _lupaEventSource: 'didYouMean'
    })
  })

  it('should add deepSearch flag for deep search results', () => {
    expect(withDeepSearchMetadata(undefined, true)).toEqual({ deepSearch: true })
  })

  it('should keep other metadata', () => {
    expect(
      withDeepSearchMetadata({ _lupaEventSource: 'didYouMean', _lupaUpdatedQuery: 'tv' }, true)
    ).toEqual({ _lupaEventSource: 'didYouMean', _lupaUpdatedQuery: 'tv', deepSearch: true })
  })
})

describe('areDeepSearchFiltersApplied', () => {
  it('should be applied without deep search filters', () => {
    expect(areDeepSearchFiltersApplied(undefined, {})).toBe(true)
  })

  it('should check term values', () => {
    const aiFilters = { brand: ['Samsung'], categories: ['Fridges'] }
    expect(
      areDeepSearchFiltersApplied(aiFilters, { brand: ['Samsung', 'LG'], categories: ['Fridges'] })
    ).toBe(true)
    expect(areDeepSearchFiltersApplied(aiFilters, { brand: ['Samsung'] })).toBe(false)
    expect(areDeepSearchFiltersApplied(aiFilters, { brand: ['LG'], categories: ['Fridges'] })).toBe(
      false
    )
  })

  it('should check hierarchy values', () => {
    const aiFilters = { category: { level: 1, terms: ['TV > OLED'] } }
    expect(
      areDeepSearchFiltersApplied(aiFilters, { category: { level: 0, terms: ['TV > OLED'] } })
    ).toBe(true)
    expect(areDeepSearchFiltersApplied(aiFilters, { category: { level: 0, terms: ['TV'] } })).toBe(
      false
    )
  })

  it('should compare ranges parsed from URL', () => {
    const aiFilters = { price: { gte: 100, lte: 500 } }
    expect(areDeepSearchFiltersApplied(aiFilters, { price: { gte: '100', lte: '500' } })).toBe(true)
    expect(areDeepSearchFiltersApplied(aiFilters, { price: { gte: '100', lte: '600' } })).toBe(
      false
    )
    expect(areDeepSearchFiltersApplied(aiFilters, {})).toBe(false)
  })

  it('should compare open and partial ranges', () => {
    expect(areDeepSearchFiltersApplied({ price: { lte: 500 } }, { price: { lte: '500' } })).toBe(
      true
    )
    expect(
      areDeepSearchFiltersApplied({ price: { gte: 1, lt: 5 } }, { price: { gte: '1', lt: '5' } })
    ).toBe(true)
  })
})
