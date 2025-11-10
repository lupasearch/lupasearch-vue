import { roundToMaxDecimals } from '../number.utils'

describe('roundToMaxDecimals (string output)', () => {
  test.each([
    { value: 0.6999, p: 0.1, expected: '0.7' },
    { value: 12, p: 0.1, expected: '12' },
    { value: 12.01, p: 0.1, expected: '12.0' },
    { value: 12.3456, p: 0.1, expected: '12.3' }
  ])('rounds $value with precision $p → $expected', ({ value, p, expected }) => {
    expect(roundToMaxDecimals(value, p)).toBe(expected)
  })

  describe('different precisions', () => {
    test.each([
      { value: 1.2345, p: 1, expected: '1' },
      { value: 1.2345, p: 0.1, expected: '1.2' },
      { value: 1.2345, p: 0.01, expected: '1.23' },
      { value: 1.2355, p: 0.01, expected: '1.24' },
      { value: 1.2345, p: 0.001, expected: '1.235' },
      { value: 18, p: 0.001, expected: '18' }
    ])('rounds $value at precision $p', ({ value, p, expected }) => {
      expect(roundToMaxDecimals(value, p)).toBe(expected)
    })
  })

  describe('negative numbers', () => {
    test.each([
      { value: -1.2345, p: 0.1, expected: '-1.2' },
      { value: -1.266, p: 0.01, expected: '-1.27' },
      { value: -12, p: 0.1, expected: '-12' }
    ])('handles negative value $value', ({ value, p, expected }) => {
      expect(roundToMaxDecimals(value, p)).toBe(expected)
    })
  })

  test('returns empty string on undefined', () => {
    expect(roundToMaxDecimals(undefined)).toBe('')
  })

  test('uses default precision 0.1 when not given', () => {
    expect(roundToMaxDecimals(3.14159)).toBe('3.1')
  })
})
