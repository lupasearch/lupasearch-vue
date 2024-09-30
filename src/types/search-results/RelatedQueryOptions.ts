import { ImageDocumentElement } from '../DocumentElement'

export enum RelatedQuerySourceType {
  FACETS = 'facets'
}

export type RelatedQuerySourceBase = {
  type: RelatedQuerySourceType
}

export type RelatedQueryFacetsSource = RelatedQuerySourceBase & {
  type: RelatedQuerySourceType.FACETS
  key: string
  count: number
}

export type RelatedQuerySource = RelatedQueryFacetsSource

export type RelatedQueryOptions = {
  source: RelatedQuerySource
  labels?: {
    title?: string
  }
  queryKey?: string // use document query key if not provided
  image?: ImageDocumentElement // use main image element if not provided
  showCount?: boolean
}
