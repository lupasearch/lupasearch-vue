import { describe, expect, it } from 'vitest'
import {
  areAiSearchFiltersApplied,
  getAiSearchFilterParams,
  withAiSearchMetadata,
  withAiSearchModifier
} from '../aiSearch.utils'

describe('getAiSearchFilterParams', () => {
  it('should return no params without filters', () => {
    expect(getAiSearchFilterParams(undefined)).toEqual([])
    expect(getAiSearchFilterParams({})).toEqual([])
  })

  it('should create term params', () => {
    expect(getAiSearchFilterParams({ brand: ['Samsung'], categories: ['Šaldytuvai'] })).toEqual([
      { name: 'f.brand', value: ['Samsung'] },
      { name: 'f.categories', value: ['Šaldytuvai'] }
    ])
  })

  it('should merge term values with current filters', () => {
    expect(
      getAiSearchFilterParams({ brand: ['Samsung', 'LG'] }, { brand: ['LG', 'Bosch'] })
    ).toEqual([{ name: 'f.brand', value: ['LG', 'Bosch', 'Samsung'] }])
  })

  it('should stringify non-string term values', () => {
    expect(getAiSearchFilterParams({ in_stock: [true, 1] as unknown as string[] })).toEqual([
      { name: 'f.in_stock', value: ['true', '1'] }
    ])
  })

  it('should create range params', () => {
    expect(getAiSearchFilterParams({ price: { gte: 100, lte: 500 } })).toEqual([
      { name: 'fr.price', value: '100:500' }
    ])
  })

  it('should create open range params', () => {
    expect(getAiSearchFilterParams({ price: { lte: 500 } })).toEqual([
      { name: 'fr.price', value: ':500' }
    ])
    expect(getAiSearchFilterParams({ price: { gt: 100 } })).toEqual([
      { name: 'fr.price', value: '100:' }
    ])
  })

  it('should create partial range params for exclusive upper bound', () => {
    expect(getAiSearchFilterParams({ price: { gte: 100, lt: 500 } })).toEqual([
      { name: 'fpr.price', value: '100:500' }
    ])
  })

  it('should skip empty range', () => {
    expect(getAiSearchFilterParams({ price: {} })).toEqual([])
  })

  it('should create hierarchy params merged with current filters', () => {
    expect(
      getAiSearchFilterParams(
        { category: { level: 1, terms: ['Appliances > Fridges'] } },
        { category: { level: 0, terms: ['Electronics'] } }
      )
    ).toEqual([{ name: 'fh.category', value: ['Electronics', 'Appliances > Fridges'] }])
  })
})

describe('withAiSearchModifier', () => {
  it('should return modifiers unchanged when aiSearch is not set', () => {
    expect(withAiSearchModifier(undefined)).toBeUndefined()
    expect(withAiSearchModifier({ facets: true, refiners: false })).toEqual({
      facets: true,
      refiners: false
    })
  })

  it('should add aiSearch modifier', () => {
    expect(withAiSearchModifier(undefined, true)).toEqual({ aiSearch: true })
    expect(withAiSearchModifier(undefined, false)).toEqual({ aiSearch: false })
  })

  it('should combine with other modifiers', () => {
    expect(withAiSearchModifier({ facets: false, refiners: true }, true)).toEqual({
      facets: false,
      refiners: true,
      aiSearch: true
    })
  })

  it('should not mutate passed modifiers', () => {
    const modifiers = { facets: true }
    withAiSearchModifier(modifiers, true)
    expect(modifiers).toEqual({ facets: true })
  })
})

describe('withAiSearchMetadata', () => {
  it('should return metadata unchanged for regular results', () => {
    expect(withAiSearchMetadata(undefined, false)).toBeUndefined()
    expect(withAiSearchMetadata({ _lupaEventSource: 'didYouMean' }, false)).toEqual({
      _lupaEventSource: 'didYouMean'
    })
  })

  it('should add aiSearch flag for AI search results', () => {
    expect(withAiSearchMetadata(undefined, true)).toEqual({ aiSearch: true })
  })

  it('should keep other metadata', () => {
    expect(
      withAiSearchMetadata({ _lupaEventSource: 'didYouMean', _lupaUpdatedQuery: 'tv' }, true)
    ).toEqual({ _lupaEventSource: 'didYouMean', _lupaUpdatedQuery: 'tv', aiSearch: true })
  })
})

describe('areAiSearchFiltersApplied', () => {
  it('should be applied without AI filters', () => {
    expect(areAiSearchFiltersApplied(undefined, {})).toBe(true)
  })

  it('should check term values', () => {
    const aiFilters = { brand: ['Samsung'], categories: ['Fridges'] }
    expect(
      areAiSearchFiltersApplied(aiFilters, { brand: ['Samsung', 'LG'], categories: ['Fridges'] })
    ).toBe(true)
    expect(areAiSearchFiltersApplied(aiFilters, { brand: ['Samsung'] })).toBe(false)
    expect(areAiSearchFiltersApplied(aiFilters, { brand: ['LG'], categories: ['Fridges'] })).toBe(
      false
    )
  })

  it('should check hierarchy values', () => {
    const aiFilters = { category: { level: 1, terms: ['TV > OLED'] } }
    expect(
      areAiSearchFiltersApplied(aiFilters, { category: { level: 0, terms: ['TV > OLED'] } })
    ).toBe(true)
    expect(areAiSearchFiltersApplied(aiFilters, { category: { level: 0, terms: ['TV'] } })).toBe(
      false
    )
  })

  it('should compare ranges parsed from URL', () => {
    const aiFilters = { price: { gte: 100, lte: 500 } }
    expect(areAiSearchFiltersApplied(aiFilters, { price: { gte: '100', lte: '500' } })).toBe(true)
    expect(areAiSearchFiltersApplied(aiFilters, { price: { gte: '100', lte: '600' } })).toBe(false)
    expect(areAiSearchFiltersApplied(aiFilters, {})).toBe(false)
  })

  it('should compare open and partial ranges', () => {
    expect(areAiSearchFiltersApplied({ price: { lte: 500 } }, { price: { lte: '500' } })).toBe(true)
    expect(
      areAiSearchFiltersApplied({ price: { gte: 1, lt: 5 } }, { price: { gte: '1', lt: '5' } })
    ).toBe(true)
  })
})
