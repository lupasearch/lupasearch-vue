/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'
import {
  addParamsToLabel,
  capitalize,
  escapeHtml,
  escapeRawHtml,
  getDisplayValue,
  getNormalizedString,
  normalizeFloat,
  slugifyClass
} from '../string.utils'

describe('getNormalizedString', () => {
  it('should return empty string if nothing is passed', () => {
    expect(getNormalizedString()).toBe('')
    expect(getNormalizedString('')).toBe('')
  })

  it('should return lowercase string', () => {
    expect(getNormalizedString('OnE')).toBe('one')
    expect(getNormalizedString('TWO')).toBe('two')
    expect(getNormalizedString('three')).toBe('three')
  })

  it('should remove special characters', () => {
    expect(getNormalizedString('get*')).toBe('get')
    expect(getNormalizedString('lu()pa')).toBe('lupa')
    expect(getNormalizedString('se{}rch')).toBe('serch')
  })

  it('should remove diacritics from letters', () => {
    expect(getNormalizedString('šešios')).toBe('sesios')
    expect(getNormalizedString('žąsys')).toBe('zasys')
    expect(getNormalizedString('ąčęėįšųū')).toBe('aceeisuu')
  })

  it('should not remove diacritics from letters if normalize function does not exist', () => {
    String.prototype.normalize = undefined as unknown as any
    expect(getNormalizedString('šešios')).toBe('šešios')
    expect(getNormalizedString('žąsys')).toBe('žąsys')
    expect(getNormalizedString('ąčęėįšųū')).toBe('ąčęėįšųū')
  })
})

describe('capitalize', () => {
  it('should return empty string if nothing is passed', () => {
    expect(capitalize()).toBe('')
    expect(capitalize('')).toBe('')
  })

  it('should convert the first letter to uppercase', () => {
    expect(capitalize('a')).toBe('A')
    expect(capitalize('č')).toBe('Č')
    expect(capitalize('books')).toBe('Books')
    expect(capitalize(' books')).toBe(' books')
    expect(capitalize('_books')).toBe('_books')
    expect(capitalize('5books')).toBe('5books')
  })
})

describe('addParamsToLabel', () => {
  it('should return the same string if there are no params', () => {
    expect(addParamsToLabel('params: {1}')).toBe('params: {1}')
  })

  it('should return replaced param values', () => {
    expect(addParamsToLabel('params: {1}', 15)).toBe('params: 15')
  })

  it('should return replaced multiple param values', () => {
    expect(addParamsToLabel('Showing {1} items of {2}. {3}', 5, 10, 'Additional')).toBe(
      'Showing 5 items of 10. Additional'
    )
  })

  it('should not replace anything if there are no keys in label', () => {
    expect(addParamsToLabel('Showing (1) items of (2). (3)', 5, 10, 'Additional')).toBe(
      'Showing (1) items of (2). (3)'
    )
  })
})

describe('getDisplayValue', () => {
  it('should return empty string if value is undefined', () => {
    expect(getDisplayValue()).toBe('')
  })

  it('should return the same value if value is string', () => {
    expect(getDisplayValue('string value')).toBe('string value')
  })

  it('should return integer number as string', () => {
    expect(getDisplayValue(20)).toBe('20')
  })

  it('should return float number as rounded string', () => {
    expect(getDisplayValue(20.5)).toBe('20.5')
    expect(getDisplayValue(20.9988888)).toBe('21')
    expect(getDisplayValue(-0.333333)).toBe('-0.33')
  })
})

describe('escapeHtml', () => {
  it.each([
    [undefined, ''],
    [null, ''],
    ['', ''],
    [false, ''],
    [NaN, '']
  ])('should return empty string if value is falsy', (value: any, expected: string) => {
    expect(escapeHtml(value)).toEqual(expected)
  })

  it('should return escaped characters', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
    expect(escapeHtml("value='123'")).toBe('value=&#039;123&#039;')
  })

  it('should preserve <del> tags used for query-diff highlighting', () => {
    expect(escapeHtml('iPhone <del>13</del> Pro')).toBe('iPhone <del>13</del> Pro')
  })

  it('should preserve multiple <del> tag pairs', () => {
    expect(escapeHtml('<del>foo</del> and <del>bar</del>')).toBe('<del>foo</del> and <del>bar</del>')
  })

  it('should still escape HTML found inside <del> tags instead of passing it through raw', () => {
    expect(escapeHtml('<del><img src=x onerror=alert(1)></del>')).toBe(
      '<del>&lt;img src=x onerror=alert(1)&gt;</del>'
    )
  })

  it('should escape a script tag disguised as del tag content', () => {
    expect(escapeHtml('<del><script>alert(1)</script></del>')).toBe(
      '<del>&lt;script&gt;alert(1)&lt;/script&gt;</del>'
    )
  })

  it('should escape everything outside of del tags as usual', () => {
    expect(escapeHtml('<b>bold</b> <del>13</del>')).toBe('&lt;b&gt;bold&lt;/b&gt; <del>13</del>')
  })
})

describe('escapeRawHtml', () => {
  it.each([
    [undefined, ''],
    [null, ''],
    ['', ''],
    [false, ''],
    [NaN, '']
  ])('should return empty string if value is falsy', (value: any, expected: string) => {
    expect(escapeRawHtml(value)).toEqual(expected)
  })

  it('should escape all html-sensitive characters', () => {
    expect(escapeRawHtml('<script>')).toBe('&lt;script&gt;')
    expect(escapeRawHtml('</div>')).toBe('&lt;/div&gt;')
    expect(escapeRawHtml('a & b')).toBe('a &amp; b')
    expect(escapeRawHtml('"quoted"')).toBe('&quot;quoted&quot;')
    expect(escapeRawHtml("value='123'")).toBe('value=&#039;123&#039;')
  })

  it('should escape ampersand before other entities', () => {
    expect(escapeRawHtml('&lt;')).toBe('&amp;lt;')
  })

  it('should escape a full xss payload', () => {
    expect(escapeRawHtml('<img src=x onerror="alert(\'x\')">')).toBe(
      '&lt;img src=x onerror=&quot;alert(&#039;x&#039;)&quot;&gt;'
    )
  })

  it('should not preserve del tags', () => {
    expect(escapeRawHtml('<del>highlight</del>')).toBe('&lt;del&gt;highlight&lt;/del&gt;')
  })

  it('should return plain text unchanged', () => {
    expect(escapeRawHtml('plain text 123')).toBe('plain text 123')
  })
})

describe('normalizeFloat', () => {
  it('should return 0 for undefined value', () => {
    expect(normalizeFloat('')).toBe(0)
    expect(normalizeFloat()).toBe(0)
  })

  it('should replace non numeric chars with empty space and convert', () => {
    expect(normalizeFloat('8xxx9')).toBeCloseTo(89)
    expect(normalizeFloat('9.9a@9')).toBeCloseTo(9.99)
    expect(normalizeFloat('++++99,9a@9')).toBeCloseTo(99.99)
    expect(normalizeFloat('vrgjerg3r490ee4')).toBeCloseTo(34904)
  })

  it('should return 0 if there are no number characters', () => {
    expect(normalizeFloat('abc')).toBeCloseTo(0)
  })
})

const cases: [string, string][] = [
  ['Hello, World!', 'hello-world'],
  ['  123 cafés  ', 'c-123-cafes'],
  ['--foo_bar--baz!!!', 'foo-bar-baz'],
  ['', 'c-'],
  ['---', 'c-'],
  ['12345', 'c-12345'],
  ['äëïöü', 'aeiou'],
  ['中文字符', '中文字符'],
  ['foo--bar', 'foo-bar'],
  ['foo- -bar', 'foo-bar'],
  ['a', 'a'],
  ['A very   long–––sentence!!!', 'a-very-long-sentence'],
  ["\"hello\"", 'hello'],
]

describe('slugifyClass', () => {
  it.each(cases)('%s → %s', (input, expected) => {
    expect(slugifyClass(input)).toBe(expected)
  })

  it('prefixes slugs that start with a dash or digit', () => {
    expect(slugifyClass('-abc')).toBe('abc')
    expect(slugifyClass('9lives')).toBe('c-9-lives')
  })

  it('always returns a valid single-class selector', () => {
    const result = slugifyClass('Example 99')
    expect(result).toMatch(/^[a-z][a-z0-9-]*$/)
  })
})
