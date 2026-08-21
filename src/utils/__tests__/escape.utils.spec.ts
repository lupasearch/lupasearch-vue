/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'
import { escapeDocumentValues } from '../escape.utils'

describe('escapeDocumentValues', () => {
  describe('primitive strings', () => {
    it('should escape all html-sensitive characters', () => {
      expect(escapeDocumentValues('<script>alert(1)</script>')).toBe(
        '&lt;script&gt;alert(1)&lt;/script&gt;'
      )
      expect(escapeDocumentValues('a & b')).toBe('a &amp; b')
      expect(escapeDocumentValues('"quoted"')).toBe('&quot;quoted&quot;')
      expect(escapeDocumentValues("it's")).toBe('it&#039;s')
    })

    it('should escape ampersand before other entities (no double-encoding surprises)', () => {
      expect(escapeDocumentValues('&lt;')).toBe('&amp;lt;')
    })

    it('should return empty string unchanged', () => {
      expect(escapeDocumentValues('')).toBe('')
    })

    it('should leave plain strings untouched', () => {
      expect(escapeDocumentValues('plain text 123')).toBe('plain text 123')
    })
  })

  describe('non-string primitives are returned as-is', () => {
    it.each([
      [0, 0],
      [42, 42],
      [-1, -1],
      [3.14, 3.14],
      [true, true],
      [false, false],
      [null, null],
      [undefined, undefined]
    ])('should return %p unchanged', (input: any, expected: any) => {
      expect(escapeDocumentValues(input)).toBe(expected)
    })

    it('should return NaN unchanged', () => {
      expect(escapeDocumentValues(NaN)).toBeNaN()
    })

    it('should return Infinity unchanged', () => {
      expect(escapeDocumentValues(Infinity)).toBe(Infinity)
      expect(escapeDocumentValues(-Infinity)).toBe(-Infinity)
    })

    it('should return bigint unchanged', () => {
      expect(escapeDocumentValues(10n)).toBe(10n)
    })

    it('should return symbol unchanged', () => {
      const sym = Symbol('<x>')
      expect(escapeDocumentValues(sym)).toBe(sym)
    })
  })

  describe('flat objects', () => {
    it('should escape string values and preserve non-string values', () => {
      const input = {
        name: '<b>Bold</b>',
        price: 19.99,
        inStock: true,
        id: null,
        tag: undefined
      }
      expect(escapeDocumentValues(input)).toEqual({
        name: '&lt;b&gt;Bold&lt;/b&gt;',
        price: 19.99,
        inStock: true,
        id: null,
        tag: undefined
      })
    })

    // Keys are lookup identifiers, not rendered content: escaping them would change
    // the property name and break `doc[key]` access in templates/functions. Only values
    // reach the DOM, so we escape values and leave keys byte-for-byte intact.
    it('should escape values only and leave object keys untouched', () => {
      const input = { '<key>': '<value>' }
      const result = escapeDocumentValues(input) as Record<string, string>
      expect(Object.keys(result)).toEqual(['<key>'])
      expect(result['<key>']).toBe('&lt;value&gt;')
    })

    it('should handle empty object', () => {
      expect(escapeDocumentValues({})).toEqual({})
    })
  })

  describe('arrays', () => {
    it('should escape string items and preserve others', () => {
      const input = ['<a>', 1, null, true, 'b & c']
      expect(escapeDocumentValues(input)).toEqual(['&lt;a&gt;', 1, null, true, 'b &amp; c'])
    })

    it('should handle empty array', () => {
      expect(escapeDocumentValues([])).toEqual([])
    })

    it('should handle array of objects', () => {
      const input = [{ v: '<x>' }, { v: '<y>' }]
      expect(escapeDocumentValues(input)).toEqual([
        { v: '&lt;x&gt;' },
        { v: '&lt;y&gt;' }
      ])
    })
  })

  describe('deep nesting', () => {
    it('should escape strings at arbitrary depth', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              payload: '<img src=x onerror="alert(\'xss\')">',
              nums: [1, 2, { deep: "O'Brien & <Sons>" }]
            }
          }
        }
      }
      expect(escapeDocumentValues(input)).toEqual({
        level1: {
          level2: {
            level3: {
              payload: '&lt;img src=x onerror=&quot;alert(&#039;xss&#039;)&quot;&gt;',
              nums: [1, 2, { deep: 'O&#039;Brien &amp; &lt;Sons&gt;' }]
            }
          }
        }
      })
    })

    it('should handle mixed arrays and objects nesting', () => {
      const input = {
        items: [
          { tags: ['<one>', '<two>'], meta: { note: '<n>' } },
          { tags: [], meta: null }
        ]
      }
      expect(escapeDocumentValues(input)).toEqual({
        items: [
          { tags: ['&lt;one&gt;', '&lt;two&gt;'], meta: { note: '&lt;n&gt;' } },
          { tags: [], meta: null }
        ]
      })
    })
  })

  describe('immutability', () => {
    it('should not mutate the original object', () => {
      const input = { name: '<b>x</b>', nested: { v: '<y>' } }
      const snapshot = JSON.parse(JSON.stringify(input))
      escapeDocumentValues(input)
      expect(input).toEqual(snapshot)
    })

    it('should not mutate the original array', () => {
      const input = ['<a>', { v: '<b>' }]
      const snapshot = JSON.parse(JSON.stringify(input))
      escapeDocumentValues(input)
      expect(input).toEqual(snapshot)
    })

    it('should return a different reference for objects and arrays', () => {
      const obj = { a: '1' }
      const arr = ['1']
      expect(escapeDocumentValues(obj)).not.toBe(obj)
      expect(escapeDocumentValues(arr)).not.toBe(arr)
    })
  })

  describe('tricky value types', () => {
    it('should not escape already-escaped strings a second time (single pass only)', () => {
      // A single pass turns & into &amp;, so pre-escaped entities gain an extra &amp;.
      expect(escapeDocumentValues('&amp;')).toBe('&amp;amp;')
    })

    it('should handle strings that are only special characters', () => {
      expect(escapeDocumentValues('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&#039;')
    })

    it('should handle unicode and emoji without altering them', () => {
      expect(escapeDocumentValues('café 日本語 🚀')).toBe('café 日本語 🚀')
    })

    it('should escape strings containing newlines and tabs but keep whitespace', () => {
      expect(escapeDocumentValues('<a>\n\t<b>')).toBe('&lt;a&gt;\n\t&lt;b&gt;')
    })
  })
})
