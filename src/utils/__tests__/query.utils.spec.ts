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
})
