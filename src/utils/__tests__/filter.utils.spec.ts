/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'
import { HierarchyTree } from '@getlupa/client-sdk/Types'
import {
  formatRange,
  getLabeledFilters,
  getMostSpecificHierarchyTerms,
  isArrayKey,
  isFacetKey,
  recursiveFilter,
  unfoldFilters
} from '../filter.utils'

describe('unfoldFilters', () => {
  it('should return empty array for empty filters', () => {
    expect(unfoldFilters()).toEqual([])
    expect(unfoldFilters({})).toEqual([])
  })

  it('should return current filters for single term facet', () => {
    expect(
      unfoldFilters({
        tag: ['books']
      })
    ).toEqual([{ key: 'tag', value: 'books', type: 'terms' }])
  })

  it('should return unfolded filters for multiple term facets', () => {
    expect(
      unfoldFilters({
        tag: ['books', 'journals'],
        discount: ['yes']
      })
    ).toEqual([
      { key: 'tag', value: 'books', type: 'terms' },
      { key: 'tag', value: 'journals', type: 'terms' },
      { key: 'discount', value: 'yes', type: 'terms' }
    ])
  })

  it('should return unfolded filters for multiple term facets if some of them are empty', () => {
    expect(
      unfoldFilters({
        tag: ['books', 'journals'],
        discount: ['yes'],
        other: []
      })
    ).toEqual([
      { key: 'tag', value: 'books', type: 'terms' },
      { key: 'tag', value: 'journals', type: 'terms' },
      { key: 'discount', value: 'yes', type: 'terms' }
    ])
  })

  it('should return unfolded filters with unfolded stats summary', () => {
    expect(
      unfoldFilters({
        tag: ['books', 'journals'],
        price: { gte: 11.2, lte: 28 },
        rating: { gte: 2, lte: 4 }
      })
    ).toEqual([
      { key: 'tag', value: 'books', type: 'terms' },
      { key: 'tag', value: 'journals', type: 'terms' },
      { key: 'price', value: '11,20 € - 28,00 €', type: 'range' },
      { key: 'rating', value: '2 - 4', type: 'range' }
    ])
  })
})

describe('formatRange', () => {
  it('should return simple range if both gte and lte values are defiend', () => {
    expect(formatRange({ lte: 14.5, gte: 12.1 })).toEqual('12.1 - 14.5')
    expect(formatRange({ lt: 14.5, gte: 12.1 })).toEqual('12.1 - 14.5')
    expect(formatRange({ lte: 14.5, gt: 12.1 })).toEqual('12.1 - 14.5')
    expect(formatRange({ lt: 14.5, gt: 12.1 })).toEqual('12.1 - 14.5')
  })

  it('should greater than range if only gte or gt values are defined', () => {
    expect(formatRange({ gte: 12.1 })).toEqual('>= 12.1')
    expect(formatRange({ gt: 5 })).toEqual('> 5')
  })

  it('should greater than range if only gte or gt values are defined', () => {
    expect(formatRange({ lte: 20 })).toEqual('<= 20')
    expect(formatRange({ lt: 18 })).toEqual('< 18')
  })

  it('should not exclude 0 values', () => {
    expect(formatRange({ lt: 14.5, gte: 0 })).toEqual('0 - 14.5')
    expect(formatRange({ lte: 0 })).toEqual('<= 0')
    expect(formatRange({ gt: 0 })).toEqual('> 0')
  })
})

describe('getLabeledFilters', () => {
  it('should return empty array for empty filters', () => {
    expect(getLabeledFilters([])).toEqual([])
  })

  it('should parse filter label from facets', () => {
    const filters = [
      { key: 'tag', value: 'books', type: 'terms' as unknown as any },
      { key: 'tag', value: 'journals', type: 'terms' as unknown as any },
      { key: 'discount', value: 'yes', type: 'terms' as unknown as any }
    ]
    const facets = [
      {
        label: 'Tag',
        key: 'tag',
        type: 'terms' as unknown as any,
        items: []
      },
      {
        label: 'Discount',
        key: 'discount',
        type: 'stats' as unknown as any,
        min: 2,
        max: 20
      }
    ]
    const expectedLabeledFacets = [
      { key: 'tag', value: 'books', label: 'Tag', type: 'terms', originalValue: 'books' },
      { key: 'tag', value: 'journals', label: 'Tag', type: 'terms', originalValue: 'journals' },
      { key: 'discount', value: 'yes', label: 'Discount', type: 'terms', originalValue: 'yes' }
    ]
    expect(getLabeledFilters(filters, facets)).toEqual(expectedLabeledFacets)
  })

  it('should use capitalized key if key is not found in facets', () => {
    const filters = [
      { key: 'tag', value: 'books', type: 'terms' as unknown as any },
      {
        key: 'category',
        value: 'electronics',
        type: 'terms' as unknown as any
      }
    ]
    const facets = [
      {
        label: 'Tag',
        key: 'tag',
        type: 'terms' as unknown as any,
        items: []
      }
    ]
    const expectedLabeledFacets = [
      { key: 'tag', value: 'books', label: 'Tag', type: 'terms', originalValue: 'books' },
      {
        key: 'category',
        value: 'electronics',
        label: 'Category',
        type: 'terms',
        originalValue: 'electronics'
      }
    ]
    expect(getLabeledFilters(filters, facets)).toEqual(expectedLabeledFacets)
  })
})

describe('getMostSpecificHierarchyTerms', () => {
  it('should return only most specific term trees', () => {
    const terms = ['a > b > c', 'a > b', 'a > d > g', 'a > d']
    const expected = ['a > b > c', 'a > d > g']
    expect(getMostSpecificHierarchyTerms(terms)).toEqual(expected)
  })

  it('should return only most specific term trees', () => {
    const terms = ['a > b > c']
    const expected = ['a > b > c']
    expect(getMostSpecificHierarchyTerms(terms)).toEqual(expected)
  })

  it('should return only most specific term trees', () => {
    const terms: string[] = []
    const expected: string[] = []
    expect(getMostSpecificHierarchyTerms(terms)).toEqual(expected)
  })

  it('should return only most specific term trees', () => {
    const terms = ['a', 'a > b', 'c', 'd', 'e', 'e > f', 'e > f > g']
    const expected = ['a > b', 'c', 'd', 'e > f > g']
    expect(getMostSpecificHierarchyTerms(terms)).toEqual(expected)
  })

  it('should return only most specific term trees', () => {
    const terms = ['a', 'e > f', 'a > b', 'a', 'e > f > g', 'c', 'd', 'e']
    const expected = ['a > b', 'e > f > g', 'c', 'd']
    expect(getMostSpecificHierarchyTerms(terms)).toEqual(expected)
  })
})

describe('isFacetKey', () => {
  it('should return true for term facet key', () => {
    expect(isFacetKey('f.category')).toBe(true)
    expect(isFacetKey('f.tag')).toBe(true)
  })

  it('should return true for range facet key', () => {
    expect(isFacetKey('fr.price')).toBe(true)
    expect(isFacetKey('fr.rating')).toBe(true)
  })

  it('should return true for hierarchy facet key', () => {
    expect(isFacetKey('fh.category')).toBe(true)
    expect(isFacetKey('fh.model')).toBe(true)
  })

  it('should return false for other query params', () => {
    expect(isFacetKey('facet')).toBe(false)
    expect(isFacetKey('fhcategory')).toBe(false)
    expect(isFacetKey('q')).toBe(false)
    expect(isFacetKey('f')).toBe(false)
    expect(isFacetKey('fr')).toBe(false)
  })
})

describe('isArrayKey', () => {
  it('should return true for term facet key', () => {
    expect(isArrayKey('f.category')).toBe(true)
    expect(isArrayKey('f.tag')).toBe(true)
  })

  it('should return false for range facet key', () => {
    expect(isArrayKey('fr.price')).toBe(false)
    expect(isArrayKey('fr.rating')).toBe(false)
  })

  it('should return true for hierarchy facet key', () => {
    expect(isArrayKey('fh.category')).toBe(true)
    expect(isArrayKey('fh.model')).toBe(true)
  })

  it('should return false for other query params', () => {
    expect(isArrayKey('facet')).toBe(false)
    expect(isArrayKey('fhcategory')).toBe(false)
    expect(isArrayKey('q')).toBe(false)
    expect(isArrayKey('f')).toBe(false)
    expect(isArrayKey('fr')).toBe(false)
  })
})

describe('recursiveFilter', () => {
  it('should return one level hierarchy tree matches', () => {
    const tree: HierarchyTree[] = [
      {
        title: 'one',
        key: 'one',
        count: 1
      },
      {
        title: 'two',
        key: 'two',
        count: 1
      },
      {
        title: 'three',
        key: 'three',
        count: 1
      },
      {
        title: 'four',
        key: 'four',
        count: 1
      }
    ]
    const expected: HierarchyTree[] = [
      {
        title: 'three',
        key: 'three',
        count: 1
      }
    ]
    expect(recursiveFilter(tree, 'three')).toEqual(expected)
  })

  it('should return the same array if que4ry is empty', () => {
    const tree: HierarchyTree[] = [
      {
        title: 'one',
        key: 'one',
        count: 1
      },
      {
        title: 'two',
        key: 'two',
        count: 1
      },
      {
        title: 'three',
        key: 'three',
        count: 1
      },
      {
        title: 'four',
        key: 'four',
        count: 1
      }
    ]
    expect(recursiveFilter(tree, '')).toEqual(tree)
  })

  it('should return tree branches that contains the children', () => {
    const tree: HierarchyTree[] = [
      {
        title: 'one',
        key: 'one',
        count: 1
      },
      {
        title: 'two',
        key: 'two',
        count: 1,
        children: [
          {
            title: 'two-two',
            key: 'two',
            count: 1,
            children: [
              {
                title: 'two-three',
                key: 'three',
                count: 1
              }
            ]
          }
        ]
      },
      {
        title: 'three',
        key: 'three',
        count: 1
      },
      {
        title: 'four',
        key: 'four',
        count: 1
      }
    ]
    const expected: HierarchyTree[] = [
      {
        title: 'two',
        key: 'two',
        count: 1,
        children: [
          {
            title: 'two-two',
            key: 'two',
            count: 1,
            children: [
              {
                title: 'two-three',
                key: 'three',
                count: 1
              }
            ]
          }
        ]
      },
      {
        title: 'three',
        key: 'three',
        count: 1
      }
    ]
    expect(recursiveFilter(tree, 'three')).toEqual(expected)
  })

  it('should return empty array for empty tree', () => {
    expect(recursiveFilter([], 'test')).toEqual([])
  })
})
