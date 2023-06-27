import type { DocumentElement } from '../DocumentElement'
import { SearchResultsProductCardOptions } from './SearchResultsProductCardOptions'

export type SearchResultsAdditionalPanelOptions = Partial<SearchResultsProductCardOptions> & {
  location: 'top' | 'bottom'
  queryKey: string
  initialCountLimit: number
  totalCountLimit: number
  links?: {
    details: string
  }
  labels: {
    showMore: string
    showLess: string
  }
  elements: DocumentElement[]
}
