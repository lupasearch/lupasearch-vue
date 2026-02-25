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

  it('should return decoded params', () => {
    expect(
      parseParams(
        undefined,
        new URLSearchParams('l=10&q=abc%20def&f.category1=Category%20with%20spaces')
      )
    ).toEqual({
      query: 'abc def',
      limit: '10',
      filters: {
        category1: ['Category with spaces']
      }
    })
  })

  it('should work with doubly-encoded params', () => {
    expect(parseParams(undefined, new URLSearchParams('q=%25C4%25AErankis'))).toEqual({
      query: 'Įrankis',
      filters: {}
    })
  })

  it('should work with single-encoded params', () => {
    expect(parseParams(undefined, new URLSearchParams('q=%C4%AErankis'))).toEqual({
      query: 'Įrankis',
      filters: {}
    })
  })

  it('should be able to decode valid percentage searches', () => {
    expect(parseParams(undefined, new URLSearchParams('q=100%25%20cotton'))).toEqual({
      query: '100% cotton',
      filters: {}
    })
  })

  it('should return same string if the encoding is invalid', () => {
    expect(parseParams(undefined, new URLSearchParams('q=abc%2'))).toEqual({
      query: 'abc%2',
      filters: {}
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
