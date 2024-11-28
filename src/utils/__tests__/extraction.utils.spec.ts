import {
  ExtractFromUrl,
  ExtractFromStorage,
  ExtractFromHtmlElementText
} from '@/types/DataExtraction'
import { extractValue, processExtractionObject } from '../extraction.utils'
import { vi } from 'vitest'

describe('extractValue', () => {
  afterEach(() => {
    vi.restoreAllMocks() // Restore original implementations after each test
    localStorage.clear() // Clear localStorage after each test
    sessionStorage.clear() // Clear sessionStorage after each test
  })

  // Test case for extracting value from URL
  test('should extract value from URL using regex', () => {
    const urlOptions: ExtractFromUrl = {
      extractFrom: 'url',
      default: 'defaultValue',
      regex: '-(\\d+)/?$'
    }
    const testUrl = 'https://www.test.lt/product-123456/'
    const originalLocation = window.location.href

    // Set the window.location.href to the test URL
    Object.defineProperty(window, 'location', {
      value: {
        href: testUrl
      },
      writable: true
    })

    const result = extractValue(urlOptions)
    expect(result).toBe('123456')

    // Reset window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        href: originalLocation
      },
      writable: true
    })
  })

  // Test case with path only url format
  test('should extract value from URL using regex with path only format', () => {
    const urlOptions: ExtractFromUrl = {
      extractFrom: 'url',
      default: 'defaultValue',
      regex: '/(\\d+)/?$'
    }
    const testUrl = 'https://www.test.lt/123456/'
    const originalLocation = window.location.href

    // Set the window.location.href to the test URL
    Object.defineProperty(window, 'location', {
      value: {
        href: testUrl
      },
      writable: true
    })

    const result = extractValue(urlOptions)
    expect(result).toBe('123456')

    // Reset window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        href: originalLocation
      },
      writable: true
    })
  })

  // Test case when URL doesn't match regex
  test('should return default value when URL does not match regex', () => {
    const urlOptions: ExtractFromUrl = {
      extractFrom: 'url',
      default: 'defaultValue',
      regex: '-(\\d+)/?$'
    }
    const testUrl = 'https://www.test.lt/product-no-match/'

    Object.defineProperty(window, 'location', {
      value: {
        href: testUrl
      },
      writable: true
    })

    const result = extractValue(urlOptions)
    expect(result).toBe('defaultValue')
  })

  // Test case for extracting value from localStorage
  test('should extract value from localStorage', () => {
    const storageOptions: ExtractFromStorage = {
      extractFrom: 'localStorage',
      default: 'defaultValue',
      key: 'testKey'
    }
    localStorage.setItem('testKey', JSON.stringify('storedValue'))

    const result = extractValue(storageOptions)
    expect(result).toBe('storedValue')
  })

  // Test case for extracting nested value from localStorage
  test('should extract nested value from localStorage', () => {
    const storageOptions: ExtractFromStorage = {
      extractFrom: 'localStorage',
      default: 'defaultValue',
      key: 'testKey',
      path: 'nested.value'
    }
    const nestedObject = { nested: { value: 'nestedValue' } }
    localStorage.setItem('testKey', JSON.stringify(nestedObject))

    const result = extractValue(storageOptions)
    expect(result).toBe('nestedValue')
  })

  // Test case for returning default value when localStorage key doesn't exist
  test('should return default value if localStorage key does not exist', () => {
    const storageOptions: ExtractFromStorage = {
      extractFrom: 'localStorage',
      default: 'defaultValue',
      key: 'nonExistingKey'
    }

    const result = extractValue(storageOptions)
    expect(result).toBe('defaultValue')
  })

  // Test case for extracting value from sessionStorage
  test('should extract value from sessionStorage', () => {
    const storageOptions: ExtractFromStorage = {
      extractFrom: 'sessionStorage',
      default: 'defaultValue',
      key: 'testSessionKey'
    }
    sessionStorage.setItem('testSessionKey', JSON.stringify('storedSessionValue'))

    const result = extractValue(storageOptions)
    expect(result).toBe('storedSessionValue')
  })

  // Test case for extracting text content from HTML element
  test('should extract text content from HTML element', () => {
    const elementOptions: ExtractFromHtmlElementText = {
      extractFrom: 'htmlElementText',
      default: 'defaultText',
      querySelector: '.test-element'
    }

    // Mock document.querySelector
    const mockElement = {
      textContent: 'extractedText'
    } as HTMLElement
    vi.spyOn(document, 'querySelector').mockReturnValue(mockElement)

    const result = extractValue(elementOptions)
    expect(result).toBe('extractedText')
  })

  // Test case when HTML element does not exist
  test('should return default value when HTML element does not exist', () => {
    const elementOptions: ExtractFromHtmlElementText = {
      extractFrom: 'htmlElementText',
      default: 'defaultText',
      querySelector: '.non-existing-element'
    }

    vi.spyOn(document, 'querySelector').mockReturnValue(null)

    const result = extractValue(elementOptions)
    expect(result).toBe('defaultText')
  })
})

describe('processExtractionObject', () => {
  test('should extract values from object with extraction options', () => {
    const value = {
      category: 15,
      tag: {
        extractFrom: 'localStorage',
        key: 'tagKey',
        default: 'defaultTag'
      }
    }

    localStorage.setItem('tagKey', JSON.stringify('tagValue'))

    expect(processExtractionObject(value)).toEqual({
      category: 15,
      tag: 'tagValue'
    })
  })

  test('should return the original object if no extraction options are found', () => {
    const value = {
      category: 15,
      tag: 'tagValue'
    }

    expect(processExtractionObject(value)).toEqual({
      category: 15,
      tag: 'tagValue'
    })
  })

  test('should default option if extraction options are invalid', () => {
    const value = {
      category: 15,
      tag: {
        extractFrom: 'invalid',
        key: 'tagKey',
        default: 'defaultTag'
      }
    }

    expect(processExtractionObject(value)).toEqual({
      category: 15,
      tag: 'defaultTag'
    })
  })

  test('should return the original object if no value is provided', () => {
    expect(processExtractionObject()).toEqual({})
  })

  test('should return the original object if an empty object is provided', () => {
    expect(processExtractionObject({})).toEqual({})
  })

  test('should ignore other objects without extract from property', () => {
    const value = {
      category: 15,
      tag: 'tagValue',
      other: {
        key: 'value'
      }
    }

    expect(processExtractionObject(value)).toEqual({
      category: 15,
      tag: 'tagValue',
      other: {
        key: 'value'
      }
    })
  })
})