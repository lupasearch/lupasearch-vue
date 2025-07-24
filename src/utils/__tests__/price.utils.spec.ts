import { describe, expect, it, beforeEach } from 'vitest'
import { formatPrice, formatPriceSummary } from '../price.utils'
import type { MultiCurrencyConfig } from '../price.utils'

const fakeMulti: MultiCurrencyConfig = {
  selectedCurrency: 'eur',
  currencies: [
    { key: 'eur', symbol: '€', template: '{1} €', separator: ',', multiplier: 1 },
    { key: 'usd', symbol: '$', template: '$ {1}', separator: '.', multiplier: 1.12 }
  ]
}

describe('formatPrice', () => {
  it('formats number to 2 decimal places (EUR default)', () => {
    expect(formatPrice(2.6598)).toEqual('2,66 €')
  })

  it('formats string to 2 decimal places (EUR default)', () => {
    expect(formatPrice('1.9831233')).toEqual('1,98 €')
  })

  it('applies EUR stub when passing multiCurrency selected=eur', () => {
    expect(formatPrice(2.5, undefined, undefined, undefined, fakeMulti)).toEqual('2,50 €')
  })

  it('applies EUR stub in summary when selected=eur', () => {
    const usdMulti = { ...fakeMulti, selected: 'eur' }
    expect(formatPriceSummary([2, 4], undefined, undefined, undefined, usdMulti)).toBe(
      '2,00 € - 4,00 €'
    )
  })

  it('uses custom fallback currency and separator when no global override', () => {
    expect(formatPrice('1.9831233', '$', '.')).toEqual('$1.98')
  })

  it('returns empty for invalid inputs', () => {
    expect(formatPrice('')).toEqual('')
    expect(formatPrice(null as unknown as string)).toEqual('')
    expect(formatPrice(undefined as unknown as string)).toEqual('')
    expect(formatPrice(NaN as unknown as string)).toEqual('')
    expect(formatPrice([] as unknown as string)).toEqual('')
    expect(formatPrice({} as unknown as string)).toEqual('')
  })

  it('returns 0,00 € for zero value', () => {
    expect(formatPrice(0)).toEqual('0,00 €')
    expect(formatPrice('0.00')).toEqual('0,00 €')
  })

  it('formats negative numbers', () => {
    expect(formatPrice(-15)).toEqual('-15,00 €')
  })

  it('formats exponential notation', () => {
    expect(formatPrice('2.3e2')).toEqual('230,00 €')
  })

  it('supports currency templates', () => {
    expect(formatPrice('2.3', '€', ',', '{1} €')).toEqual('2,30 €')
    expect(formatPrice('2.3', '€', ',', '{1}')).toEqual('2,30')
    expect(formatPrice('2.3', '$', '.', '$ {1}')).toEqual('$ 2.30')
    expect(formatPrice('2.3', '$', '.', '{1} $')).toEqual('2.30 $')
    expect(formatPrice(0, '$', '.', '$ {1}')).toEqual('$ 0.00')
  })
})

describe('formatPriceSummary', () => {
  it('formats a range with both min and max (EUR default)', () => {
    expect(formatPriceSummary([2, 4])).toBe('2,00 € - 4,00 €')
    expect(formatPriceSummary([0, 20])).toBe('0,00 € - 20,00 €')
  })

  it('formats > min only', () => {
    expect(formatPriceSummary([2, undefined])).toBe('> 2,00 €')
    expect(formatPriceSummary([0, undefined])).toBe('> 0,00 €')
  })

  it('formats < max only', () => {
    expect(formatPriceSummary([undefined, 20])).toBe('< 20,00 €')
    expect(formatPriceSummary([undefined, 0])).toBe('< 0,00 €')
  })

  it('respects currency fallback when global config missing', () => {
    expect(formatPriceSummary([2, 4], '£', '.', '{1} £')).toBe('2.00 £ - 4.00 £')
  })

  it('applies explicit templates and separators', () => {
    expect(formatPriceSummary([2, 4], '€', ',', '{1} €')).toBe('2,00 € - 4,00 €')
    expect(formatPriceSummary([2, 4], '€', ',', '{1}')).toBe('2,00 - 4,00')
    expect(formatPriceSummary([2, 4], '$', '.', '{1} $')).toBe('2.00 $ - 4.00 $')
    expect(formatPriceSummary([2, 4], '$', '.', '$ {1}')).toBe('$ 2.00 - $ 4.00')
    expect(formatPriceSummary([2], '€', ',', '{1} €')).toBe('> 2,00 €')
    expect(formatPriceSummary([2], '€', ',', '{1}')).toBe('> 2,00')
    expect(formatPriceSummary([2], '$', '.', '${1}')).toBe('> $2.00')
  })
})
