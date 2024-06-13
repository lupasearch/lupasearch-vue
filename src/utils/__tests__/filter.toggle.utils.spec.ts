/* eslint-disable @typescript-eslint/no-explicit-any */
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { toggleHierarchyFilter, toggleRangeFilter, toggleTermFilter } from '../filter.toggle.utils'

import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('toggleTermFilter', () => {
  let append: any

  beforeEach(() => {
    append = vi.fn()
  })

  it('should append param to empty filters', () => {
    toggleTermFilter(append, { type: 'terms', value: 'books', key: 'tag' })
    expect(append).toHaveBeenCalledWith({
      params: [{ name: 'f.tag', value: ['books'] }],
      paramsToRemove: [QUERY_PARAMS.PAGE]
    })
  })

  it('should append param to existing filters', () => {
    toggleTermFilter(append, { type: 'terms', value: 'new', key: 'tag' }, undefined, {
      tag: ['old']
    })
    expect(append).toHaveBeenCalledWith({
      params: [{ name: 'f.tag', value: ['new', 'old'] }],
      paramsToRemove: [QUERY_PARAMS.PAGE]
    })
  })

  it('should remove param that already exist', () => {
    toggleTermFilter(
      append,
      { type: 'terms', key: 'tag', value: '2' },
      undefined,

      { tag: ['1', '2', '3'] }
    )
    expect(append).toHaveBeenCalledWith({
      params: [{ name: 'f.tag', value: ['1', '3'] }],
      paramsToRemove: [QUERY_PARAMS.PAGE]
    })
  })
})

describe('toggleRangeFilter', () => {
  let append: any

  beforeEach(() => {
    append = vi.fn()
  })

  it('should append param to empty filters', () => {
    toggleRangeFilter(append, {
      type: 'range',
      value: ['2', '5'],
      key: 'price'
    })
    expect(append).toHaveBeenCalledWith({
      params: [{ name: 'fr.price', value: '2:5' }],
      paramsToRemove: [QUERY_PARAMS.PAGE],
      encode: false
    })
  })
})

describe('toggleHierarchyFilter', () => {
  let append: any

  beforeEach(() => {
    append = vi.fn()
  })

  it('should append param to empty filters', () => {
    toggleHierarchyFilter(append, {
      type: 'hierarchy',
      key: 'category',
      value: 'a > b'
    })
    expect(append).toHaveBeenCalledWith({
      params: [{ name: 'fh.category', value: ['a > b'] }],
      paramsToRemove: [QUERY_PARAMS.PAGE]
    })
  })

  it('should append param to existing params', () => {
    toggleHierarchyFilter(
      append,
      {
        type: 'hierarchy',
        key: 'category',

        value: 'c > d'
      },
      undefined,

      {
        category: {
          terms: ['a > b']
        }
      }
    )
    expect(append).toHaveBeenCalledWith({
      params: [{ name: 'fh.category', value: ['c > d', 'a > b'] }],
      paramsToRemove: [QUERY_PARAMS.PAGE]
    })
  })

  it('should remove the filter if key matches', () => {
    toggleHierarchyFilter(
      append,
      {
        type: 'hierarchy',
        key: 'category',

        value: 'c > d'
      },
      undefined,
      {
        category: {
          terms: ['a > b', 'c > d', 'e > f']
        }
      },
      true
    )
    expect(append).toHaveBeenCalledWith({
      params: [{ name: 'fh.category', value: ['a > b', 'e > f'] }],
      paramsToRemove: [QUERY_PARAMS.PAGE]
    })
  })

  it('should remove only the last segment if remove all filters is not passed', () => {
    toggleHierarchyFilter(
      append,
      {
        type: 'hierarchy',
        key: 'category',

        value: 'c > d > e'
      },
      undefined,
      {
        category: {
          terms: ['a > b', 'c > d > e', 'e > f']
        }
      }
    )
    expect(append).toHaveBeenCalledWith({
      params: [{ name: 'fh.category', value: ['a > b', 'c > d', 'e > f'] }],
      paramsToRemove: [QUERY_PARAMS.PAGE]
    })
  })

  it('should remove only the last segment if remove all filters is not passed', () => {
    toggleHierarchyFilter(
      append,
      {
        type: 'hierarchy',
        key: 'category',

        value: 'c > d'
      },
      undefined,
      {
        category: {
          terms: ['a > b', 'c > d > e', 'e > f']
        }
      }
    )
    expect(append).toHaveBeenCalledWith({
      params: [{ name: 'fh.category', value: ['a > b', 'c', 'e > f'] }],
      paramsToRemove: [QUERY_PARAMS.PAGE]
    })
  })
})
