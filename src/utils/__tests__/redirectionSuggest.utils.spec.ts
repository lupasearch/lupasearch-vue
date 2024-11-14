import { RedirectionSuggestionOptions } from '@/types/search-results/RedirectionSuggestionOptionts'
import { describe, expect, it } from 'vitest'
import { extractRedirectionSuggestion } from '../redirectionSuggest.utils'

describe('extractRedirectionSuggestion', () => {
  const option1: RedirectionSuggestionOptions = {
    matchCharacters: 'abc'
  }

  const option2: RedirectionSuggestionOptions = {
    matchWords: ['hello', 'world']
  }

  const option3: RedirectionSuggestionOptions = {
    matchCharacters: 'xyz',
    matchWords: ['test']
  }

  it('should return null when options are undefined', () => {
    const result = extractRedirectionSuggestion('search text')
    expect(result).toBeNull()
  })

  it('should return null when options array is empty', () => {
    const result = extractRedirectionSuggestion('search text', [])
    expect(result).toBeNull()
  })

  it('should return null when searchText is empty', () => {
    const result = extractRedirectionSuggestion('', [option1, option2])
    expect(result).toBeNull()
  })

  it('should return the option when searchText includes a character from matchCharacters', () => {
    const result = extractRedirectionSuggestion('some text with b', [option1, option2])
    expect(result).toEqual(option1)
  })

  it('should return the option when searchText includes a word from matchWords', () => {
    const result = extractRedirectionSuggestion('this is hello world test', [option1, option2])
    expect(result).toEqual(option2)
  })

  it('should return the option when searchText matches both matchCharacters and matchWords', () => {
    const result = extractRedirectionSuggestion('this is a test with x character', [option3])
    expect(result).toEqual(option3)
  })

  it('should return the first matching option when multiple options match', () => {
    const result = extractRedirectionSuggestion('hello a', [option2, option3])
    expect(result).toEqual(option2)
  })

  it('should return null when no options match', () => {
    const result = extractRedirectionSuggestion('nothing here', [option1, option2])
    expect(result).toBeNull()
  })

  it('should skip options with undefined matchCharacters and matchWords', () => {
    const optionWithNoMatch: RedirectionSuggestionOptions = {}
    const result = extractRedirectionSuggestion('some text with a', [optionWithNoMatch, option1])
    expect(result).toEqual(option1)
  })

  it('should handle options with empty matchCharacters and matchWords', () => {
    const emptyOption: RedirectionSuggestionOptions = {
      matchCharacters: '',
      matchWords: []
    }
    const result = extractRedirectionSuggestion('some text with a', [emptyOption, option1])
    expect(result).toEqual(option1)
  })
})
