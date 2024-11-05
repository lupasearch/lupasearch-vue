import { escapeHtml } from './string.utils'

export const pick = <T extends Record<string, unknown>, U extends keyof T>(
  obj: T,
  keys: Array<U>
): Pick<T, U> => {
  const ret = Object.create({})
  for (const k of keys) {
    ret[k] = obj[k]
  }
  return ret
}

export const getHint = (suggestion: string, inputValue: string): string => {
  if (!inputValue) {
    return escapeHtml(suggestion)
  }
  return (
    suggestion?.replace(
      inputValue?.toLocaleLowerCase(),
      `<strong>${escapeHtml(inputValue?.toLocaleLowerCase())}</strong>`
    ) ?? ''
  )
}

// https://stackoverflow.com/a/56781239
export const reverseKeyValue = (obj: Record<string, string>): Record<string, string> => {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k.toLowerCase()]))
}

export const pickClosestNumber = (numbers: number[], closestTo: number): number => {
  return numbers.reduce((prev, curr) =>
    Math.abs(curr - closestTo) < Math.abs(prev - closestTo) ? curr : prev
  )
}

export const getPageCount = (total: number, limit: number): number => {
  return Math.ceil(total / limit) || 0
}

export const isObject = (value: unknown) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
