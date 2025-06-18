import { addParamsToLabel } from '@/utils/string.utils'
import { useOptionsStore } from '@/stores/options'
import { storeToRefs } from 'pinia'

export interface CurrencyConfig {
  key: string
  symbol: string
  template?: string
  separator: string
  multiplier: number
}

export type MultiCurrencyConfig = {
  selected: string
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

  if (!multiCurrency) {
    const store = useOptionsStore()
    const { multiCurrency: mcRef } = storeToRefs(store)
    multiCurrency = mcRef.value
  }

  let symbol = currency
  let sep = separator
  let tpl = currencyTemplate
  let mult = 1

  if (multiCurrency) {
    const cfg = multiCurrency.currencies.find((c) => c.key === multiCurrency.selected)
    if (cfg && price != null) {
      symbol = cfg.symbol
      sep = cfg.separator
      tpl = cfg.template ?? tpl
      mult = cfg.multiplier
    }
  }

  const raw = typeof price === 'number' ? price : parseFloat(price)
  if (isNaN(raw)) return ''
  const adjusted = raw * mult

  const amount = getAmount(adjusted, sep)
  if (!amount) return ''

  if (tpl) {
    return addParamsToLabel(tpl, amount)
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
