import { describe, expect, it } from 'vitest'
import { QueryParams } from '@/types/search-results/QueryParams'
import { createPublicQuery } from '../query.utils'

describe('createPublicQuery', () => {
  it('should create a new public query', () => {
    const params: QueryParams = {
      query: 'abc',
      limit: '5',
      page: '1'
    }

    expect(createPublicQuery(params)).toEqual({
      searchText: 'abc',
      limit: 5,
      offset: 0
    })
  })

  it('should set empty adjusted search text', () => {
    const params: QueryParams = { query: 'tv', adjusted: '' }

    expect(createPublicQuery(params).adjustedSearchText).toBe('')
  })

  it('should not set adjusted search text when it is not in params', () => {
    expect(createPublicQuery({ query: 'tv' })).not.toHaveProperty('adjustedSearchText')
  })

  it('should use configured sort when sort key matches', () => {
    const sortOptions = [{ key: 'price-asc', label: 'Price', config: [{ price: 'asc' as const }] }]

    expect(createPublicQuery({ query: 'tv', sort: 'price-asc' }, sortOptions).sort).toEqual([
      { price: 'asc' }
    ])
  })

  it('should use serialized sort when sort key does not match', () => {
    const sortOptions = [{ key: 'price-asc', label: 'Price', config: [{ price: 'asc' as const }] }]

    expect(
      createPublicQuery({ query: 'tv', sort: 'in_stock:desc,price:asc' }, sortOptions).sort
    ).toEqual([{ in_stock: 'desc' }, { price: 'asc' }])
  })

  it('should fall back to default sort when sort is not valid', () => {
    const sortOptions = [
      {
        key: 'relevance',
        label: 'Relevance',
        config: [{ _relevance: 'desc' as const }],
        default: true
      }
    ]

    expect(createPublicQuery({ query: 'tv', sort: 'unknown' }, sortOptions).sort).toEqual([
      { _relevance: 'desc' }
    ])
  })
})
