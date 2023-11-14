export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type SearchChatRequestBase = {
  queryKey: string
}

export type SearchChatRequest = SearchChatRequestBase & {
  userPrompt: string
  messageHistory: ChatMessage[]
}

export type SearchChatPraseAlternativesRequest = SearchChatRequestBase & { phrases: string[] }

export type SearchChatBestProductMatchesRequest = SearchChatRequestBase & {
  initialQuery: string
  productStrings: string[]
  messageHistory: ChatMessage[]
}

export type SearchChatTextRequest = SearchChatRequestBase & {
  initialQuery: string
  messageHistory: ChatMessage[]
}
