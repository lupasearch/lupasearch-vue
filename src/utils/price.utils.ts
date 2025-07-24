import { addParamsToLabel } from '@/utils/string.utils'

export interface CurrencyConfig {
  key: string
  symbol: string
  template?: string
  separator: string
  multiplier: number
}

export type MultiCurrencyConfig = {
  selectedCurrency: string
  currencies: CurrencyConfig[]
}

const getAmount = (price: string | number, separator = '.') => {
  if (typeof price === 'number') {
    return `${price.toFixed(2).replace('.', separator)}`
  }
  const value = parseFloat(price)
  if (isNaN(value)) {
    return ''
  }
  return value.toFixed(2).replace('.', separator)
}

export const formatPrice = (
  price?: string | number,
  currency = '€',
  separator = ',',
  currencyTemplate = '',
  multiCurrency?: MultiCurrencyConfig
): string => {
  if (price !== 0 && !price) {
    return ''
  }

  let symbol = currency
  let separate = separator
  let template = currencyTemplate
  let multiply = 1

  if (multiCurrency) {
    const cfg = multiCurrency.currencies.find((c) => c.key === multiCurrency.selectedCurrency)
    if (cfg && price != null) {
      symbol = cfg.symbol
      separate = cfg.separator
      template = cfg.template ?? template
      multiply = cfg.multiplier
    }
  }

  const raw = typeof price === 'number' ? price : parseFloat(price)
  if (isNaN(raw)) {
    return ''
  }
  const adjusted = raw * multiply

  const amount = getAmount(adjusted, separate)
  if (!amount) {
    return ''
  }

  if (template) {
    return addParamsToLabel(template, amount)
  }
  if (symbol === '$') {
    return `${symbol}${amount}`
  }
  return `${amount} ${symbol}`
}

export const formatPriceSummary = (
  [min, max]: [min?: number | string, max?: number | string],
  currency?: string,
  separator = ',',
  currencyTemplate = '',
  multiCurrency?: MultiCurrencyConfig
): string => {
  if (min != null && max != null) {
    return [
      formatPrice(min, currency, separator, currencyTemplate, multiCurrency),
      formatPrice(max, currency, separator, currencyTemplate, multiCurrency)
    ].join(' - ')
  }
  if (min != null) {
    return `> ${formatPrice(min, currency, separator, currencyTemplate, multiCurrency)}`
  }
  return `< ${formatPrice(max!, currency, separator, currencyTemplate, multiCurrency)}`
}

export const getAdjustedNumber = (
  value?: string | number,
  multiplier?: number
): number | string => {
  if (!value) {
    return value
  }
  if (typeof value === 'number') {
    return multiplier ? value * multiplier : value
  }
  const parsed = parseFloat(value)
  if (isNaN(parsed)) {
    return value
  }
  return multiplier ? parsed * multiplier : parsed
}
