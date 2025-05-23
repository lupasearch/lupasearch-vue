import type { DisplayCondition, DocumentElement } from '../DocumentElement'
import type { Document, FilterGroup } from '@getlupa/client-sdk/Types'
import { CustomDocumentHtmlAttributes } from '../General'
import { SearchBoxBadgeOptions } from './SearchBoxBadgeOptions'
import { DataExtraction } from '../DataExtraction'

export enum SearchBoxPanelType {
  SUGGESTION = 'suggestion',
  DOCUMENT = 'document',
  RELATED_SOURCE = 'related-source'
}

export type SearchBoxPanelLinks = {
  details: string
}

export type SearchBoxPanelLabels = {
  title?: string
  topResultsTitle?: string
  goToResultsTitle?: string
}

export type SearchBoxPanelBase = {
  type: SearchBoxPanelType
  queryKey: string
  limit: number
  labels?: SearchBoxPanelLabels
  gridArea?: string
  visibility?: {
    showWhenKeyHasNoResults?: string
  }
}

export type DocumentSearchBoxPanel = SearchBoxPanelBase & {
  type: SearchBoxPanelType.DOCUMENT
  initialFilters?: FilterGroup | Record<string, DataExtraction>
  links: SearchBoxPanelLinks
  elements: DocumentElement[]
  titleKey?: string
  idKey?: string
  customClassName?: string
  searchBySuggestion?: boolean
  badges?: SearchBoxBadgeOptions
  showGoToResults?: boolean
  isInStock?: DisplayCondition | ((doc: Document) => boolean)
  programmaticNavigation?: boolean
  customDocumentHtmlAttributes?: CustomDocumentHtmlAttributes
}

export type RelatedSourcePanel = Omit<DocumentSearchBoxPanel, 'type'> & {
  type: SearchBoxPanelType.RELATED_SOURCE
  // Existing document type panel to extract related field source ids (e.g. authorId, categoryId, etc.)
  sourceIds: {
    queryKey: string
    field: string
  }
  target: {
    queryKey: string
  }
}

export type SuggestionSearchBoxPanel = SearchBoxPanelBase & {
  type: SearchBoxPanelType.SUGGESTION
  highlight: boolean
  customClassName?: string
}

export type SearchBoxPanel = DocumentSearchBoxPanel | SuggestionSearchBoxPanel | RelatedSourcePanel
