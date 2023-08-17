export type ChatContent = {
  key: string
  userInput: string
  allPhrases: string[]
  suggestedPhrases: string[]
  simplifiedPhrases?: string[]
  phraseAlternatives?: string[]
  bestItems?: string[]
}
