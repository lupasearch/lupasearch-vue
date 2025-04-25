import { kebabCase } from 'lodash'
import type { Document } from '@getlupa/client-sdk/Types'

export const getNormalizedString = (str?: string | number): string => {
  if (!str) {
    return ''
  }
  const transformedStr = typeof str === 'string' ? str : str.toString()
  return transformedStr.normalize === undefined
    ? transformedStr.toLocaleLowerCase()?.trim()
    : transformedStr
        .toLocaleLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s.-_/]/g, '')
        ?.trim()
}

export const getTransformedString = (str?: string | number): string => {
  if (!str) {
    return ''
  }
  const transformedStr = typeof str === 'string' ? str : str.toString()
  return transformedStr.normalize === undefined
    ? transformedStr.toLocaleLowerCase()?.trim()
    : transformedStr.toLocaleLowerCase().normalize('NFKD')?.trim()
}

export const capitalize = (str?: string): string => {
  if (!str) {
    return ''
  }
  return str[0].toLocaleUpperCase() + str.slice(1)
}

export const addParamsToLabel = (label: string, ...params: unknown[]): string => {
  if (!params || params.length < 1) {
    return label
  }
  const paramKeys = Array.from(Array(params.length).keys())
  return paramKeys.reduce((a, c) => a.replace(`{${c + 1}}`, params[c] as string), label)
}

export const getRandomString = (length: number): string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

const toFixedIfNecessary = (value: string, precision = 2): string => {
  return (+parseFloat(value).toFixed(precision)).toString()
}

export const getDisplayValue = (value?: string | number): string => {
  if (value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  return toFixedIfNecessary(value.toString())
}

export const getProductKey = (
  index: string,
  product: Document,
  idKey: string | undefined
): string => {
  if (!idKey) {
    return index
  }
  if (product[idKey]) {
    return product[idKey] as string
  }
  return index
}

export const normalizeFloat = (value?: string): number => {
  if (!value) {
    return 0
  }
  return +value?.replace(/[^0-9,.]/g, '')?.replace(',', '.')
}

export const escapeHtml = (value?: string): string => {
  if (!value) {
    return ''
  }

  let output = ''
  let isSkip = false

  value.split(/(<del>.*?<\/del>)/g).forEach((segment) => {
    if (segment.startsWith('<del>') && segment.endsWith('</del>')) {
      output += segment
      isSkip = true
    }

    if (!isSkip) {
      output += segment
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    if (isSkip) {
      isSkip = false
    }
  })

  return output
}

export const inputMatches = (input: string, possibleValues: string[]): boolean => {
  if (!input) {
    return false
  }
  const normalizedInput = getNormalizedString(input)
  return possibleValues.some((v) => getNormalizedString(v).startsWith(normalizedInput))
}

export const inputsAreEqual = (input: string, possibleValues: string[]): boolean => {
  if (!input) {
    return false
  }
  const normalizedInput = getTransformedString(input)
  return possibleValues.some((v) => getTransformedString(v) === normalizedInput)
}

const levenshteinDistance = (s = '', t = '') => {
  if (!s?.length) {
    return t.length
  }
  if (!t?.length) {
    return s.length
  }
  const arr = []
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i]
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            )
    }
  }
  return arr[t.length][s.length]
}

export const findClosestStringValue = <T>(input: string, possibleValues: T[], key: keyof T): T => {
  const directMatch = possibleValues.find((v) => v[key] === input)
  if (directMatch) {
    return directMatch
  }
  const distances = possibleValues.map((v) => levenshteinDistance(`${v[key]}`, input))
  const minDistance = Math.min(...distances)
  const closestValue = possibleValues.filter((_, i) => distances[i] === minDistance)?.[0]
  return closestValue
}

export const slugifyClass = (s?: string): string => {
  let slug = kebabCase(s)
  if (!slug || /^[0-9-]/.test(slug)) {
    slug = `c-${slug}`
  } // CSS-safe start
  return slug
}
