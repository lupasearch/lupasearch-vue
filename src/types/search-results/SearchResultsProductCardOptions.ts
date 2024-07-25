import type { Document } from '@getlupa/client-sdk/Types'
import type { DocumentElement } from '../DocumentElement'
import type { BadgeElement, BadgeGenerateOptions } from './BadgeOptions'
import type { RoutingBehavior } from './RoutingBehavior'
import type { SearchResultsOptionLabels } from './SearchResultsOptions'
import { CustomDocumentHtmlAttributes } from '../General'

export type SearchResultsProductCardOptions = {
  labels: SearchResultsOptionLabels
  routingBehavior?: RoutingBehavior
  isInStock?: (doc: Document) => boolean
  badges?: SearchResultBadgeOptions
  links?: {
    details: string
  }
  elements: DocumentElement[]
  queryKey: string
  idKey?: string
  titleKey?: string
  priceKeys?: string[]
  customDocumentHtmlAttributes?: CustomDocumentHtmlAttributes
}

export type SearchResultBadgeOptions = {
  anchor: AnchorPosition
  elements: BadgeElement[]
  generate?: BadgeGenerateOptions
}

export type AnchorPosition = 'tr' | 'tl'
