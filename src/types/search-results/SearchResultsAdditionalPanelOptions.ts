import type { DocumentElement } from '../DocumentElement'

export type SearchResultsAdditionalPanelOptions = {
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
