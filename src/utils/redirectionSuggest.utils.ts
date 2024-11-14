import { RedirectionSuggestionOptions } from '@/types/search-results/RedirectionSuggestionOptionts'

const checkHasMatchCharacters = (
  option: RedirectionSuggestionOptions,
  searchText: string
): boolean => option.matchCharacters?.split('')?.some((char) => searchText.includes(char))

const checkHasMatchWords = (option: RedirectionSuggestionOptions, searchText: string): boolean =>
  searchText.split(' ')?.some((word) => option.matchWords?.includes(word))

export const extractRedirectionSuggestion = (
  searchText = '',
  options?: RedirectionSuggestionOptions[]
): RedirectionSuggestionOptions | null => {
  for (const option of options || []) {
    const hasMatchCharacters = option.matchCharacters
    const hasMatchWords = option.matchWords
    if (hasMatchCharacters && !hasMatchWords && checkHasMatchCharacters(option, searchText)) {
      return option
    }
    if (hasMatchWords && !hasMatchCharacters && checkHasMatchWords(option, searchText)) {
      return option
    }
    if (
      hasMatchCharacters &&
      hasMatchWords &&
      checkHasMatchCharacters(option, searchText) &&
      checkHasMatchWords(option, searchText)
    ) {
      return option
    }
  }
  return null
}
