/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'
import { InputSuggestionFacet } from '@/types/search-box/Common'
import { generateLink, generateResultLink, linksMatch } from '../link.utils'

describe('generateLink', () => {
  it('should return original link pattern if it has no replaceable properties', () => {
    expect(generateLink('/specific-url', {})).toEqual('/specific-url')
  })

  it('should replace link parts with object properties', () => {
    const document = { id: '123fwe9', slug: 'test-product' }
    expect(generateLink('/products/{id}-{slug}.html', document)).toEqual(
      '/products/123fwe9-test-product.html'
    )
  })

  it('should replace properties with empty strings if prop does not exist in the document', () => {
    const document = { slug: 'test-product' }
    expect(generateLink('/products/{id}-{slug}.html', document)).toEqual(
      '/products/-test-product.html'
    )
  })

  it('should not replace link for unbalanced brackets', () => {
    const document = { id: '123fwe9', slug: 'test-product' }
    expect(generateLink('/products/{id-.html', document)).toEqual('/products/{id-.html')
  })

  it('should replace numeric properties', () => {
    const document = { id: '123fwe9', slug: 'test-product', number: 6 }
    expect(generateLink('/{slug}?q={number}', document)).toEqual('/test-product?q=6')
  })

  it('should replace full urls', () => {
    const document = { id: '123fwe9', url: 'https://lupasearch.com/product/1' }
    expect(generateLink('{url}', document)).toEqual('https://lupasearch.com/product/1')
  })
})

describe('generateResultLink', () => {
  it('should return just a link if no query is provided', () => {
    expect(generateResultLink('/just-a-link')).toBe('/just-a-link')
  })

  it('should return just a link if query text is empty', () => {
    expect(generateResultLink('/just-a-link', '')).toBe('/just-a-link')
  })

  it('should return link with search query as parameter', () => {
    expect(generateResultLink('/search', 'books')).toBe('/search?q=books')
  })

  it('should keep lt characers not encoded', () => {
    expect(generateResultLink('/search', 'ąčęą')).toBe('/search?q=ąčęą')
  })

  it('should keep space', () => {
    expect(generateResultLink('/search', 'one two')).toBe('/search?q=one two')
  })

  it('should encode search parameter', () => {
    expect(generateResultLink('/search', 'bo?o&ks')).toBe('/search?q=bo%3Fo%26ks')
  })

  it('should include facet in link', () => {
    const facet: InputSuggestionFacet = {
      key: 'category',
      title: 'Shoes'
    }
    expect(generateResultLink('/search', 'boots', facet)).toBe('/search?q=boots&f.category=Shoes')
  })

  it('should include encoded facet in link', () => {
    const facet: InputSuggestionFacet = {
      key: 'cate_gory',
      title: 'Shoe?s'
    }
    expect(generateResultLink('/search', 'boots', facet)).toBe(
      '/search?q=boots&f.cate_gory=Shoe%3Fs'
    )
  })
})

describe('linksMatch', () => {
  it('should return true if links are identical', () => {
    expect(linksMatch('https://lupasearch.com/link-1', 'https://lupasearch.com/link-1')).toBe(true)
  })

  it.each([
    [undefined, undefined],
    ['', undefined],
    ['link', null],
    [null, null],
    ['', '']
  ])('should return false if one or both links are falsy', (link1: any, link2: any) => {
    expect(linksMatch(link1, link2)).toBe(false)
  })

  it('should return false if links do not match', () => {
    expect(linksMatch('https://lupasearch.com/link-1', 'https://lupasearch.com/link-2')).toBe(false)
  })

  it('should return true if link relative parts match match', () => {
    expect(
      linksMatch('https://lupasearch.com/link-1/link-5', 'http://localhost:8080/link-1/link-5')
    ).toBe(true)
  })

  it('should return false if link relative parts do not match match', () => {
    expect(
      linksMatch('https://lupasearch.com/links-1/link-5', 'http://localhost:8080/link-1/link-5')
    ).toBe(false)
  })

  it('should return true for partial link match', () => {
    expect(linksMatch('https://lupasearch.com/link-1/link-5', '/link-1/link-5')).toBe(true)
  })

  it('should return true for partial link match with trailing slash', () => {
    expect(
      linksMatch('https://lupasearch.com/link-1/link-5', 'https://lupasearch.com/link-1/link-5/')
    ).toBe(true)
  })

  it('should return false if partial link does not match', () => {
    expect(linksMatch('https://lupasearch.com/link-1/link-5', '/link-1/link-6')).toBe(false)
  })
})
