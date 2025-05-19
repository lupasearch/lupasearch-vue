import { addParamsToLabel } from './string.utils'
import { useOptionsStore }  from '@/stores/options'

export interface CurrencyConfig {
  key:        string
  symbol:     string
  template?:  string
  separator:  string
  multiplier: number
}

export interface MultiCurrencyConfig {
  selected:   string
  currencies: CurrencyConfig[]
}

const getAmount = (price: string | number, separator = '.') => {
  if (typeof price === 'number') {
    return `${price.toFixed(2)?.replace('.', separator)}`
  }
  const value = parseFloat(price)
  if (isNaN(value)) {
    return ''
  }
  return value.toFixed(2)?.replace('.', separator)
}

export const formatPrice = (
  price?: string | number,
  currency = '€',
  separator = ',',
  currencyTemplate = ''
): string => {
  if (price !== 0 && !price) {
    return ''
  }
  const store = useOptionsStore()
  const { selected, currencies } = store.multiCurrency
  const cfg = currencies.find(c => c.key === selected)

  const raw = typeof price === 'number' ? price : parseFloat(price)
  if (isNaN(raw)) return ''
  const adjusted = raw * (cfg?.multiplier ?? 1)

  const sepToUse = cfg?.separator ?? separator
  const amount   = getAmount(adjusted, sepToUse)
  if (!amount) return ''

  const tpl = cfg?.template ?? currencyTemplate
  if (tpl) {
    return addParamsToLabel(tpl, amount)
  }

  const sym = cfg?.symbol ?? currency
  return `${amount} ${sym}`
}

export const formatPriceSummary = (
  [min, max]: [min?: number | string, max?: number | string],
  currency?: string,
  separator = ',',
  currencyTemplate = ''
): string => {
  if (min !== undefined && max !== undefined) {
    return `${formatPrice(min, currency, separator, currencyTemplate)} - ${formatPrice(
      max,
      currency,
      separator,
      currencyTemplate
    )}`
  }
  if (min !== undefined) {
    return `> ${formatPrice(min, currency, separator, currencyTemplate)}`
  }
  return `< ${formatPrice(max, currency, separator, currencyTemplate)}`
}
