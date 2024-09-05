import {
  DataExtraction,
  ExtractFromHtmlElementText,
  ExtractFromStorage,
  ExtractFromUrl
} from '@/types/DataExtraction'
import { isObject } from './picker.utils'

export const extractValue = <T>(options: DataExtraction): T => {
  switch (options.extractFrom) {
    case 'url':
      return extractFromUrl(options) as T

    case 'localStorage':
    case 'sessionStorage':
      return extractFromStorage(options) as T

    case 'htmlElementText':
      return extractFromHtmlElementText(options) as T

    default:
      return (options as DataExtraction).default as T
  }
}

// Function to handle URL extraction
const extractFromUrl = (options: ExtractFromUrl): string | number | Record<string, unknown> => {
  const regex = new RegExp(options.regex)
  const match = window.location.href.match(regex)
  return match ? match[1] : options.default
}

// Function to handle localStorage/sessionStorage extraction
const extractFromStorage = (
  options: ExtractFromStorage
): string | number | Record<string, unknown> => {
  const storage = options.extractFrom === 'localStorage' ? localStorage : sessionStorage
  let rawValue = ''
  try {
    rawValue = storage.getItem(options.key)
  } catch {
    return options.default
  }

  if (rawValue) {
    try {
      const parsedValue = JSON.parse(rawValue)
      return options.path ? getValueFromPath(parsedValue, options.path) : parsedValue
    } catch {
      return rawValue
    }
  }

  return options.default
}

// Function to handle HTML element text extraction
const extractFromHtmlElementText = (
  options: ExtractFromHtmlElementText
): string | number | Record<string, unknown> => {
  const element = document.querySelector(options.querySelector)
  return element ? element.textContent?.trim() || options.default : options.default
}

// Helper function to get a nested value using a dot notation path
const getValueFromPath = (obj: Record<string, unknown>, path: string): unknown => {
  return path
    .split('.')
    .reduce((value, key) => (value && (value as Record<string, unknown>)[key]) || null, obj)
}

export const processExtractionObject = (value: Record<string, unknown> = {}) => {
  const parsedObject: Record<string, unknown> = {}
  for (const key in value) {
    if (isObject(value[key]) && (value[key] as DataExtraction)?.extractFrom) {
      parsedObject[key] = extractValue(value[key] as DataExtraction)
    } else {
      parsedObject[key] = value[key]
    }
  }
  return parsedObject
}
