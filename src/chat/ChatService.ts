import { Environment } from '@getlupa/client-sdk/Types'
import { SdkOptions } from '..'
import { ChatMessage, SearchChatRequest } from '@/types/chat/SearchChatRequest'
import { SearchChatResponse } from '@/types/chat/SearchChatResponse'
import { ChatContent } from '@/types/chat/ChatLog'
// TODO: after prototype is accepted, move to search-sdk project

const Env = {
  production: 'https://api.lupasearch.com/v1/',
  staging: 'https://api.staging.lupasearch.com/v1/'
}

const defaultConfig = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}

const headers = defaultConfig.headers

const getApiUrl = (environment: Environment, customBaseUrl?: string) => {
  if (customBaseUrl) {
    return customBaseUrl
  }
  return Env[environment] || Env['production']
}

const suggestSearchChatPhrases = async (
  options: SdkOptions,
  request: SearchChatRequest
): Promise<Partial<SearchChatResponse> & { success: boolean; errors: any }> => {
  const { environment, customBaseUrl } = options
  try {
    const res = await fetch(`${getApiUrl(environment, customBaseUrl)}chat/`, {
      ...defaultConfig,
      body: JSON.stringify(request),
      headers: { ...headers, ...(options.customHeaders ?? {}) }
    })
    if (res.status < 400) {
      const data = await res.json()
      return { ...data, success: true }
    }
    const errors = await res.json()
    return { success: false, errors }
  } catch (e) {
    options?.onError?.(e)
    return { success: false, errors: [e] }
  }
}

const suggestPhraseAlternatives = async (
  options: SdkOptions,
  { phrases }: { phrases: string[] }
): Promise<Partial<SearchChatResponse> & { success: boolean; errors: any }> => {
  const { environment, customBaseUrl } = options
  try {
    const res = await fetch(`${getApiUrl(environment, customBaseUrl)}chat/phraseAlternatives`, {
      ...defaultConfig,
      body: JSON.stringify({ phrases }),
      headers: { ...headers, ...(options.customHeaders ?? {}) }
    })
    if (res.status < 400) {
      const data = await res.json()
      return { ...data, success: true }
    }
    const errors = await res.json()
    return { success: false, errors }
  } catch (e) {
    options?.onError?.(e)
    return { success: false, errors: [e] }
  }
}

const suggestSimplifiedPhrases = async (
  options: SdkOptions,
  { phrases }: { phrases: string[] }
): Promise<Partial<SearchChatResponse> & { success: boolean; errors: any }> => {
  const { environment, customBaseUrl } = options
  try {
    const res = await fetch(`${getApiUrl(environment, customBaseUrl)}chat/simplify`, {
      ...defaultConfig,
      body: JSON.stringify({ phrases }),
      headers: { ...headers, ...(options.customHeaders ?? {}) }
    })
    if (res.status < 400) {
      const data = await res.json()
      return { ...data, success: true }
    }
    const errors = await res.json()
    return { success: false, errors }
  } catch (e) {
    options?.onError?.(e)
    return { success: false, errors: [e] }
  }
}

const suggestBestProductMatches = async (
  options: SdkOptions,
  {
    initialQuery,
    productStrings,
    messageHistory
  }: { initialQuery: string; productStrings: string[]; messageHistory: ChatMessage[] }
): Promise<{ products?: string[]; success: boolean; errors: any }> => {
  const { environment, customBaseUrl } = options
  try {
    const res = await fetch(`${getApiUrl(environment, customBaseUrl)}chat/bestProducts`, {
      ...defaultConfig,
      body: JSON.stringify({ initialQuery, messageHistory, productStrings }),
      headers: { ...headers, ...(options.customHeaders ?? {}) }
    })
    if (res.status < 400) {
      const data = await res.json()
      return { ...data, success: true }
    }
    const errors = await res.json()
    return { success: false, errors }
  } catch (e) {
    options?.onError?.(e)
    return { success: false, errors: [e] }
  }
}

const prepareChatHistory = (chatLog: ChatContent[]) => {
  const history: ChatMessage[] = []
  for (const log of chatLog) {
    history.push({
      role: 'user',
      content: log.userInput
    })
    history.push({
      role: 'assistant',
      content: log.suggestedPhrases.join(', ')
    })
    if (log.bestItems?.length > 0) {
      history.push({
        role: 'assistant',
        content: `I suggest these best item matches to your query: ${log.bestItems?.join(', ')}`
      })
    }
  }
  return history
}

export default {
  suggestSearchChatPhrases,
  suggestPhraseAlternatives,
  suggestSimplifiedPhrases,
  suggestBestProductMatches,
  prepareChatHistory
}
