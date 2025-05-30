import { addParamsToLabel } from './string.utils'
export interface CurrencyConfig {
  key: string
  symbol: string
  template?: string
  separator: string
  multiplier: number
}

export interface MultiCurrencyConfig {
  selected: string
  currencies: CurrencyConfig[]
}

const getAmount = (price: string | number, separator = '.') => {
  if (typeof price === 'number') {
    return price.toFixed(2).replace('.', separator)
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

  let cfgCurrency = currency
  let cfgSeparator = separator
  let cfgTemplate = currencyTemplate
  let multiplier = 1
  if (multiCurrency) {
    const { selected, currencies } = multiCurrency
    const cfg = currencies.find((c) => c.key === selected)
    if (cfg) {
      cfgCurrency = cfg.symbol
      cfgSeparator = cfg.separator
      cfgTemplate = cfg.template ?? currencyTemplate
      multiplier = cfg.multiplier
    }
  }

  const raw = typeof price === 'number' ? price : parseFloat(price)
  if (isNaN(raw)) return ''
  const adjusted = raw * multiplier

  const amount = getAmount(adjusted, cfgSeparator)
  if (!amount) return ''

  if (cfgTemplate) {
    return addParamsToLabel(cfgTemplate, amount)
  }

  return `${amount} ${cfgCurrency}`
}

export const formatPriceSummary = (
  [min, max]: [min?: number | string, max?: number | string],
  currency?: string,
  separator = ',',
  currencyTemplate = '',
  multiCurrency?: MultiCurrencyConfig
): string => {
  if (min !== undefined && max !== undefined) {
    return `${formatPrice(
      min,
      currency,
      separator,
      currencyTemplate,
      multiCurrency
    )} - ${formatPrice(max, currency, separator, currencyTemplate, multiCurrency)}`
  }
  if (min !== undefined) {
    return `> ${formatPrice(min, currency, separator, currencyTemplate, multiCurrency)}`
  }
  return `< ${formatPrice(max, currency, separator, currencyTemplate, multiCurrency)}`
}
