import type { DocumentElement } from '../DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'

export enum SearchBoxPanelType {
  SUGGESTION = 'suggestion',
  DOCUMENT = 'document'
}

export type SearchBoxPanelLinks = {
  details: string
}

export type SearchBoxPanelBase = {
  type: SearchBoxPanelType
  queryKey: string
  limit: number
}

export type DocumentSearchBoxPanel = SearchBoxPanelBase & {
  type: SearchBoxPanelType.DOCUMENT
  links: SearchBoxPanelLinks
  elements: DocumentElement[]
  titleKey?: string
  idKey?: string
  customClassName?: string
  searchBySuggestion?: boolean
  isInStock?: (doc: Document) => boolean
}

export type SuggestionSearchBoxPanel = SearchBoxPanelBase & {
  type: SearchBoxPanelType.SUGGESTION
  highlight: boolean
  customClassName?: string
}

export type SearchBoxPanel = DocumentSearchBoxPanel | SuggestionSearchBoxPanel
