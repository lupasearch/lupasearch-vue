import { Environment } from '@getlupa/client-sdk/Types'
import { SdkOptions } from '..'
import {
  ChatMessage,
  SearchChatBestProductMatchesRequest,
  SearchChatPraseAlternativesRequest,
  SearchChatRequest,
  SearchChatTextRequest
} from '@/types/chat/SearchChatRequest'
import { SearchChatResponse } from '@/types/chat/SearchChatResponse'
import { ChatContent } from '@/types/chat/ChatLog'
import { ChatSettings } from '@/types/chat/ChatOptions'
import { DEFAULT_HEADERS, DEFAULT_REQUEST_CONFIG, getApiUrl } from '@/utils/api.utils'
// TODO: after prototype is accepted, move to search-sdk project

const suggestSearchChatPhrases = async (
  options: SdkOptions,
  request: SearchChatRequest,
  chatSettings?: ChatSettings
): Promise<Partial<SearchChatResponse> & { success: boolean; errors: any }> => {
  const { environment, customBaseUrl } = options
  const model = chatSettings?.model ? `?model=${chatSettings.model}` : ``
  try {
    const res = await fetch(`${getApiUrl(environment, customBaseUrl)}chat${model}`, {
      ...DEFAULT_REQUEST_CONFIG,
      body: JSON.stringify(request),
      headers: { ...DEFAULT_HEADERS, ...(options.customHeaders ?? {}) }
    })
    if (res.status < 400) {
      const data = await res.json()
      return { ...data, success: true }
    }
    const errors = await res.json()
    options?.onError?.(errors)
    return { success: false, errors }
  } catch (e) {
    options?.onError?.(e)
    return { success: false, errors: [e] }
  }
}

const suggestPhraseAlternatives = async (
  options: SdkOptions,
  request: SearchChatPraseAlternativesRequest,
  chatSettings?: ChatSettings
): Promise<Partial<SearchChatResponse> & { success: boolean; errors: any }> => {
  const { environment, customBaseUrl } = options
  const model = chatSettings?.model ? `?model=${chatSettings.model}` : ``
  try {
    const res = await fetch(
      `${getApiUrl(environment, customBaseUrl)}chat/phraseAlternatives${model}`,
      {
        ...DEFAULT_REQUEST_CONFIG,
        body: JSON.stringify(request),
        headers: { ...DEFAULT_HEADERS, ...(options.customHeaders ?? {}) }
      }
    )
    if (res.status < 400) {
      const data = await res.json()
      return { ...data, success: true }
    }
    const errors = await res.json()
    options?.onError?.(errors)
    return { success: false, errors }
  } catch (e) {
    options?.onError?.(e)
    return { success: false, errors: [e] }
  }
}

const suggestBestProductMatches = async (
  options: SdkOptions,
  request: SearchChatBestProductMatchesRequest,
  chatSettings?: ChatSettings
): Promise<{ products?: string[]; success: boolean; errors: any }> => {
  const { environment, customBaseUrl } = options
  const model = chatSettings?.model ? `?model=${chatSettings.model}` : ``
  try {
    const res = await fetch(`${getApiUrl(environment, customBaseUrl)}chat/bestProducts${model}`, {
      ...DEFAULT_REQUEST_CONFIG,
      body: JSON.stringify(request),
      headers: { ...DEFAULT_HEADERS, ...(options.customHeaders ?? {}) }
    })
    if (res.status < 400) {
      const data = await res.json()
      return { ...data, success: true }
    }
    const errors = await res.json()
    options?.onError?.(errors)
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

const getTextResponseChunkStream = (
  options: SdkOptions,
  request: SearchChatTextRequest,
  onChunkReceived: (chunk: string) => void,
  chatSettings?: ChatSettings
) => {
  const model = chatSettings?.model ? `?model=${chatSettings.model}` : ``
  fetch(`${getApiUrl(options.environment, options.customBaseUrl)}chat/text${model}`, {
    ...DEFAULT_REQUEST_CONFIG,
    body: JSON.stringify(request),
    headers: { ...DEFAULT_HEADERS, ...(options.customHeaders ?? {}) }
  })
    .then((response) => {
      const reader = response.body.getReader()
      return reader.read().then(function processStream({ done, value }) {
        if (done) {
          return ''
        }
        const result = new TextDecoder('utf-8').decode(value)
        const sanitezedResult = result.replace('\n', '<div class="br"></div>')
        onChunkReceived(sanitezedResult)
        return reader.read().then(processStream)
      })
    })
    .catch((error) => {
      console.error(`Fetch Error: ${error}`)
    })
}

export default {
  suggestSearchChatPhrases,
  suggestPhraseAlternatives,
  suggestBestProductMatches,
  prepareChatHistory,
  getTextResponseChunkStream
}
