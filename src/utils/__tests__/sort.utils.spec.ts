import { describe, expect, it } from 'vitest'
import { findSortKey, getSortParamValue, parseSerializedSort, serializeSort } from '../sort.utils'
import type { SearchResultsSortOptions } from '@/types/search-results/SearchResultsSort'

const sortOptions: SearchResultsSortOptions[] = [
  { key: 'relevance', label: 'Relevance', config: [{ _relevance: 'desc' }], default: true },
  { key: 'cheapest', label: 'Cheapest', config: [{ in_stock: 'desc' }, { price: 'asc' }] }
]

describe('serializeSort', () => {
  it('should serialize sort config', () => {
    expect(serializeSort([{ in_stock: 'desc' }, { price: 'asc' }])).toBe('in_stock:desc,price:asc')
  })

  it('should serialize empty sort', () => {
    expect(serializeSort([])).toBe('')
  })
})

describe('parseSerializedSort', () => {
  it('should parse serialized sort', () => {
    expect(parseSerializedSort('in_stock:desc,price:asc')).toEqual([
      { in_stock: 'desc' },
      { price: 'asc' }
    ])
  })

  it('should parse fields that contain separators', () => {
    expect(parseSerializedSort('attributes.size:desc')).toEqual([{ 'attributes.size': 'desc' }])
  })

  it.each(['', 'price', 'price:up', ':asc', 'price:asc,', 'relevance'])(
    'should return undefined for invalid value "%s"',
    (value) => {
      expect(parseSerializedSort(value)).toBeUndefined()
    }
  )

  it('should be the reverse of serializeSort', () => {
    const sort = [{ in_stock: 'desc' as const }, { price: 'asc' as const }]
    expect(parseSerializedSort(serializeSort(sort))).toEqual(sort)
  })
})

describe('findSortKey', () => {
  it('should find configured sort key with the same config', () => {
    expect(findSortKey(sortOptions, [{ in_stock: 'desc' }, { price: 'asc' }])).toBe('cheapest')
  })

  it('should not match sort with different order', () => {
    expect(findSortKey(sortOptions, [{ price: 'asc' }, { in_stock: 'desc' }])).toBeUndefined()
  })
})

describe('getSortParamValue', () => {
  it('should return configured sort key when sort matches', () => {
    expect(getSortParamValue(sortOptions, [{ in_stock: 'desc' }, { price: 'asc' }])).toBe(
      'cheapest'
    )
  })

  it('should return serialized sort when no config matches', () => {
    expect(getSortParamValue(sortOptions, [{ rating: 'desc' }])).toBe('rating:desc')
  })

  it('should return serialized sort without sort options', () => {
    expect(getSortParamValue(undefined, [{ rating: 'desc' }])).toBe('rating:desc')
  })
})
