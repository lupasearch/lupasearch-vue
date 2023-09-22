export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type SearchChatRequest = {
  userPrompt: string
  messageHistory: ChatMessage[]
  queryKey: string
}
