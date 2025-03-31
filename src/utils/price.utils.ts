import { addParamsToLabel } from './string.utils'

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
  const amount = getAmount(price, separator)
  if (!amount) {
    return ''
  }
  if (currencyTemplate) {
    return addParamsToLabel(currencyTemplate, amount)
  }
  return `${amount} ${currency}`
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
