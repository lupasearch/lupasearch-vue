import { describe, expect, it } from 'vitest'
import { getRemovableParams, parseParams } from '../params.utils'

describe('parseParams', () => {
  it('should return empty object if search params do not exist', () => {
    expect(parseParams()).toStrictEqual({})
  })

  it('should return param object if search params do exist', () => {
    expect(
      parseParams(
        undefined,
        new URLSearchParams('l=10&q=abc&f.category1=Category&f.category1=CategorySecond')
      )
    ).toEqual({
      query: 'abc',
      limit: '10',
      filters: {
        category1: ['Category', 'CategorySecond']
      }
    })
  })
})

describe('getRemovableParams', () => {
  it('should return passed parameters if they are not set to all', () => {
    const url = new URL('https://lupasearch.com/search?q=a&p=1&l=2&s=key')
    expect(getRemovableParams(url, undefined, ['p', 'q'])).toEqual(['p', 'q'])
  })

  it('should return all parameters if all is passed', () => {
    const url = new URL('https://lupasearch.com/search?q=a&p=1&l=2&s=key')
    expect(getRemovableParams(url, undefined, 'all')).toEqual(['q', 'l', 'p', 's'])
  })

  it('should include filter params if all is passed', () => {
    const url = new URL('https://lupasearch.com/search?q=a&p=1&l=2&s=key&f.test=123&fr.range=12-34')
    expect(getRemovableParams(url, undefined, 'all')).toEqual([
      'q',
      'l',
      'p',
      's',
      'f.test',
      'fr.range'
    ])
  })
})
