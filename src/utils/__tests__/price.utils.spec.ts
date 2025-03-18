import { describe, expect, it } from 'vitest'
import { formatPrice, formatPriceSummary } from '../price.utils'

describe('formatPrice', () => {
  it('should return number formatted to 2 decimal places', () => {
    expect(formatPrice(2.6598)).toEqual('2,66 €')
  })

  it('should return string formatted to 2 decimal places', () => {
    expect(formatPrice('1.9831233')).toEqual('1,98 €')
  })

  it('should return string formatted to 2 decimal places with custom currency', () => {
    expect(formatPrice('1.9831233', '$', '.')).toEqual('1.98 $')
  })

  it('should return nothing for empty string', () => {
    expect(formatPrice('')).toEqual('')
  })

  it('should return nothing for null or undefined', () => {
    expect(formatPrice(null as unknown as string)).toEqual('')
    expect(formatPrice(undefined as unknown as string)).toEqual('')
    expect(formatPrice(NaN as unknown as string)).toEqual('')
    expect(formatPrice([] as unknown as string)).toEqual('')
    expect(formatPrice({} as unknown as string)).toEqual('')
  })

  it('should return correct format for 0 price', () => {
    expect(formatPrice(0)).toEqual('0,00 €')
  })

  it('should return correct format for 0.00 price', () => {
    expect(formatPrice('0.00')).toEqual('0,00 €')
  })

  it('should return correct format for negative price', () => {
    expect(formatPrice(-15)).toEqual('-15,00 €')
  })

  it('should return correct format for exp numbers', () => {
    expect(formatPrice('2.3e2')).toEqual('230,00 €')
  })

  it('should return empty string if value cannot be parsed', () => {
    expect(formatPrice('asf')).toEqual('')
  })

  it('should format price with template', () => {
    expect(formatPrice('2.3', '€', ',', '{1} €')).toEqual('2,30 €')
    expect(formatPrice('2.3', '€', ',', '{1}')).toEqual('2,30')
    expect(formatPrice('2.3', '$', '.', '$ {1}')).toEqual('$ 2.30')
    expect(formatPrice('2.3', '$', '.', '{1} $')).toEqual('2.30 $')
    expect(formatPrice(0, '$', '.', '$ {1}')).toEqual('$ 0.00')
  })
})

describe('formatPriceSummary', () => {
  it('should render price range for both min and max values', () => {
    expect(formatPriceSummary([2, 4])).toBe('2,00 € - 4,00 €')
    expect(formatPriceSummary([0, 20])).toBe('0,00 € - 20,00 €')
  })

  it('should render price range for only min value', () => {
    expect(formatPriceSummary([2])).toBe('> 2,00 €')
    expect(formatPriceSummary([0])).toBe('> 0,00 €')
  })

  it('should render price range for only min value', () => {
    expect(formatPriceSummary([undefined, 20])).toBe('< 20,00 €')
    expect(formatPriceSummary([undefined, 0])).toBe('< 0,00 €')
  })

  it('should render price range with template', () => {
    expect(formatPriceSummary([2, 4], '€', ',', '{1} €')).toBe('2,00 € - 4,00 €')
    expect(formatPriceSummary([2, 4], '€', ',', '{1}')).toBe('2,00 - 4,00')
    expect(formatPriceSummary([2, 4], '$', '.', '{1} $')).toBe('2.00 $ - 4.00 $')
    expect(formatPriceSummary([2, 4], '$', '.', '$ {1}')).toBe('$ 2.00 - $ 4.00')

    expect(formatPriceSummary([2], '€', ',', '{1} €')).toBe('> 2,00 €')
    expect(formatPriceSummary([2], '€', ',', '{1}')).toBe('> 2,00')
    expect(formatPriceSummary([2], '$', '.', '${1}')).toBe('> $2.00')
  })
})
