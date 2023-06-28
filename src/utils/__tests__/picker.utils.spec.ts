/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import { getHint, getPageCount, pick, pickClosestNumber, reverseKeyValue } from '../picker.utils'

describe('picker.utils', () => {
  it('getPageCount should return correct page count', () => {
    expect(getPageCount(50, 50)).toBe(1)

    expect(getPageCount(25, 50)).toBe(1)

    expect(getPageCount(50, 25)).toBe(2)

    expect(getPageCount(50, 49)).toBe(2)

    expect(getPageCount(23, 10)).toBe(3)
  })

  it('pickClosestNumber should return correct closest number', () => {
    expect(pickClosestNumber([10, 20, 25, 50], 30)).toBe(25)

    expect(pickClosestNumber([10, 20, 25, 50], 2)).toBe(10)

    expect(pickClosestNumber([10, 20, 25, 50], 100)).toBe(50)

    expect(pickClosestNumber([10, 20, 25, 50], 20)).toBe(20)
  })

  it('pick should pick correct properties', () => {
    expect(
      pick({ property1: '', property2: '', property3: '' }, ['property1', 'property3'])
    ).toStrictEqual({
      property1: '',
      property3: ''
    })
  })

  it('reverseKeyValue should reverse keys and values correctly', () => {
    expect(reverseKeyValue({ KEY1: 'value1', key2: 'value2', key3: 'value3' })).toStrictEqual({
      value1: 'key1',
      value2: 'key2',
      value3: 'key3'
    })
  })
})

describe('getHint', () => {
  it('should highlight phrase at the start', () => {
    expect(getHint('milk', 'mi')).toBe('<strong>mi</strong>lk')
  })

  it('should highlight phrase at the start of another word', () => {
    expect(getHint('chocolate milk', 'mil')).toBe('chocolate <strong>mil</strong>k')
  })

  it('should not highlight phrase if it does not appear in the string', () => {
    expect(getHint('chocolate milk', 'flour')).toBe('chocolate milk')
  })

  it('should not highlight phrase if string is empty', () => {
    expect(getHint('', 'flour')).toBe('')
  })

  it('should not highlight phrase if input is empty', () => {
    expect(getHint('test', '')).toBe('test')
  })

  it('should not highlight if phrase is undefined', () => {
    expect(getHint(undefined as unknown as any, '')).toBe('')
  })

  it('should not highlight if input value is undefined', () => {
    expect(getHint('value', undefined as unknown as any)).toBe('value')
  })

  it('should only highlight the first occurrence of the phrase', () => {
    expect(getHint('long long low', 'lo')).toBe('<strong>lo</strong>ng long low')
  })
})
