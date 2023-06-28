import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DisplaySuggestion } from '@/types/search-box/Common'
import { Suggestion } from '@getlupa/client-sdk/Types'
import { flattenSuggestions } from '../suggestion.utils'

describe('flattenSuggestions', () => {
  beforeEach(() => {
    vi.mock('@/utils/picker.utils', () => ({ getHint: vi.fn().mockReturnValue('<highlighted>') }))
    vi.clearAllMocks()
  })

  it('should return empty array if empty array was passed', () => {
    expect(flattenSuggestions([], '')).toEqual([])
  })

  it('should return mapped suggestions without facets', () => {
    const suggestions: Suggestion[] = [
      { suggestion: 'one' },
      { suggestion: 'two' },
      { suggestion: 'three' }
    ]
    const expectedSuggestions: DisplaySuggestion[] = [
      {
        display: 'one',
        displayHighlight: '<highlighted>',
        suggestion: {
          suggestion: 'one'
        }
      },
      {
        display: 'two',
        displayHighlight: '<highlighted>',
        suggestion: {
          suggestion: 'two'
        }
      },
      {
        display: 'three',
        displayHighlight: '<highlighted>',
        suggestion: {
          suggestion: 'three'
        }
      }
    ]
    expect(flattenSuggestions(suggestions, 'test')).toEqual(expectedSuggestions)
  })

  it('should return mapped suggestions with single facet', () => {
    const suggestionWithFacets = {
      suggestion: 'one',
      facets: {
        category: [
          { count: 1, title: 'numbers' },
          { count: 2, title: 'digits' }
        ]
      }
    }
    const suggestions: Suggestion[] = [
      suggestionWithFacets,
      { suggestion: 'two' },
      { suggestion: 'three' }
    ]
    const expectedSuggestions: DisplaySuggestion[] = [
      {
        display: 'one',
        displayHighlight: '<highlighted>',
        suggestion: suggestionWithFacets
      },
      {
        display: 'one',
        displayHighlight: '<highlighted>',
        facet: {
          key: 'category',
          title: 'numbers',
          count: 1
        },
        suggestion: suggestionWithFacets
      },
      {
        display: 'one',
        displayHighlight: '<highlighted>',
        facet: {
          key: 'category',
          title: 'digits',
          count: 2
        },
        suggestion: suggestionWithFacets
      },
      {
        display: 'two',
        displayHighlight: '<highlighted>',
        suggestion: {
          suggestion: 'two'
        }
      },
      {
        display: 'three',
        displayHighlight: '<highlighted>',
        suggestion: {
          suggestion: 'three'
        }
      }
    ]
    expect(flattenSuggestions(suggestions, 'test')).toEqual(expectedSuggestions)
  })

  it('should return mapped suggestions with multiple facets', () => {
    const suggestionWithFacets = {
      suggestion: 'one',
      facets: {
        category: [
          { count: 1, title: 'numbers' },
          { count: 2, title: 'digits' }
        ],
        tag: [{ count: 5, title: 'book' }]
      }
    }
    const suggestions: Suggestion[] = [
      suggestionWithFacets,
      { suggestion: 'two' },
      { suggestion: 'three' }
    ]
    const expectedSuggestions: DisplaySuggestion[] = [
      {
        display: 'one',
        displayHighlight: '<highlighted>',
        suggestion: suggestionWithFacets
      },
      {
        display: 'one',
        displayHighlight: '<highlighted>',
        facet: {
          key: 'category',
          title: 'numbers',
          count: 1
        },
        suggestion: suggestionWithFacets
      },
      {
        display: 'one',
        displayHighlight: '<highlighted>',
        facet: {
          key: 'category',
          title: 'digits',
          count: 2
        },
        suggestion: suggestionWithFacets
      },
      {
        display: 'one',
        displayHighlight: '<highlighted>',
        facet: {
          key: 'tag',
          title: 'book',
          count: 5
        },
        suggestion: suggestionWithFacets
      },
      {
        display: 'two',
        displayHighlight: '<highlighted>',
        suggestion: {
          suggestion: 'two'
        }
      },
      {
        display: 'three',
        displayHighlight: '<highlighted>',
        suggestion: {
          suggestion: 'three'
        }
      }
    ]
    expect(flattenSuggestions(suggestions, 'test')).toEqual(expectedSuggestions)
  })
})
