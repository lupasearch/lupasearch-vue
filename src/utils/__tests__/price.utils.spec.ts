import { describe, expect, it } from 'vitest'
import { formatPrice, formatPriceSummary } from '../price.utils'
import { GLOBAL_CURRENCY_CONFIG } from '@/constants/currency.config'

describe('formatPrice (defaults)', () => {
  it('should return number formatted to 2 decimal places (EUR)', () => {
    expect(formatPrice(2.6598)).toEqual('2,66 €')
  })

  it('should return string formatted to 2 decimal places (EUR)', () => {
    expect(formatPrice('1.9831233')).toEqual('1,98 €')
  })

  it('should return with a custom fallback currency (no global config)', () => {
    expect(formatPrice('1.9831233', '$', '.')).toEqual('1,98 €')
  })

  it('should return nothing for invalid inputs', () => {
    expect(formatPrice('')).toEqual('')
    expect(formatPrice(null as unknown as string)).toEqual('')
    expect(formatPrice(undefined as unknown as string)).toEqual('')
    expect(formatPrice(NaN as unknown as string)).toEqual('')
  })

  it('should return "0,00 €" for 0', () => {
    expect(formatPrice(0)).toEqual('0,00 €')
  })

  it('should return "-15,00 €" for negative price', () => {
    expect(formatPrice(-15)).toEqual('-15,00 €')
  })
})

describe('formatPriceSummary', () => {
  it('formats a range in EUR by default', () => {
    GLOBAL_CURRENCY_CONFIG.selected = 'eur'
    expect(formatPriceSummary([2, 4])).toBe('2,00 € - 4,00 €')
  })

  it('formats > min in EUR by default', () => {
    GLOBAL_CURRENCY_CONFIG.selected = 'eur'
    expect(formatPriceSummary([2, undefined])).toBe('> 2,00 €')
  })

  it('formats < max in EUR by default', () => {
    GLOBAL_CURRENCY_CONFIG.selected = 'eur'
    expect(formatPriceSummary([undefined, 20])).toBe('< 20,00 €')
  })

  it('formats a range with explicit fallback currency', () => {
    expect(formatPriceSummary([2, 4], '$', '.')).toBe('2,00 € - 4,00 €')
  })

  it('respects fallback template if currency not found', () => {
    GLOBAL_CURRENCY_CONFIG.selected = 'gbp'
    expect(formatPriceSummary([2, 4], '£', '.', '{1} £')).toBe('2.00 £ - 4.00 £')
  })
})
