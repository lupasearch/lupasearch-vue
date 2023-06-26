import type { DisplaySuggestion } from '@/types/search-box/Common'
import type { Suggestion, SuggestionFacet } from '@getlupa/client-sdk/Types'
import { getHint } from './picker.utils'

const flattenFacet = (
  key: string,
  facets: SuggestionFacet[],
  suggestion: Suggestion,
  inputValue: string
): DisplaySuggestion[] => {
  return facets.map((f) => ({
    displayHighlight: getHint(suggestion.suggestion, inputValue ?? ''),
    display: suggestion.suggestion,
    suggestion,
    facet: {
      key,
      ...f
    }
  }))
}

const flattenSuggestionFacet = (
  suggestion: Suggestion,
  suggestionFacets: Record<string, SuggestionFacet[]>,
  inputValue: string
): DisplaySuggestion[] => {
  const facets = Object.keys(suggestionFacets).map((key) => ({
    key,
    value: suggestionFacets[key]
  }))
  const seed: DisplaySuggestion[] = []
  const facetSuggestions = facets.reduce(
    (a, c) => [...a, ...flattenFacet(c.key, c.value, suggestion, inputValue)],
    seed
  )
  return [mapSuggestion(suggestion, inputValue), ...facetSuggestions]
}

const mapSuggestion = (suggestion: Suggestion, inputValue: string) => {
  return {
    displayHighlight: getHint(suggestion.suggestion, inputValue ?? ''),
    display: suggestion.suggestion,
    suggestion
  }
}

const flattenSuggestion = (suggestion: Suggestion, inputValue: string): DisplaySuggestion[] => {
  return suggestion.facets
    ? flattenSuggestionFacet(suggestion, suggestion.facets, inputValue)
    : [mapSuggestion(suggestion, inputValue)]
}

export const flattenSuggestions = (
  suggestions: Suggestion[],
  inputValue: string
): DisplaySuggestion[] => {
  const seed: DisplaySuggestion[] = []
  return suggestions.reduce((a, c) => [...a, ...flattenSuggestion(c, inputValue)], seed)
}
