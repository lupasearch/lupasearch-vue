import type { DocumentElement } from '../DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'
import { CustomDocumentHtmlAttributes } from '../General'

export enum SearchBoxPanelType {
  SUGGESTION = 'suggestion',
  DOCUMENT = 'document'
}

export type SearchBoxPanelLinks = {
  details: string
}

export type SearchBoxPanelLabels = {
  topResultsTitle?: string
}

export type SearchBoxPanelBase = {
  type: SearchBoxPanelType
  queryKey: string
  limit: number
  labels?: SearchBoxPanelLabels
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
  customDocumentHtmlAttributes?: CustomDocumentHtmlAttributes
}

export type SuggestionSearchBoxPanel = SearchBoxPanelBase & {
  type: SearchBoxPanelType.SUGGESTION
  highlight: boolean
  customClassName?: string
}

export type SearchBoxPanel = DocumentSearchBoxPanel | SuggestionSearchBoxPanel
