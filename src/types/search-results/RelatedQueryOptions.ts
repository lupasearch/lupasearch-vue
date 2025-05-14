import { ImageDocumentElement } from '../DocumentElement'

export enum RelatedQuerySourceType {
  FACETS = 'facets'
}

export type RelatedQuerySourceBase = {
  type: RelatedQuerySourceType
}

export type RelatedQueryFacetsSourceQuery = {
  facetKey: string
  queryKey: string
  type: 'document' | 'suggestion',
  maxCount?: number
}

export type RelatedQueryFacetsSource = RelatedQuerySourceBase & {
  type: RelatedQuerySourceType.FACETS
  key: string
  count: number
  mode?: 'query' | 'filter'
  queries?: RelatedQueryFacetsSourceQuery[]
}

export type RelatedQuerySource = RelatedQueryFacetsSource

export type RelatedQueryOptions = {
  source?: RelatedQuerySource
  labels?: {
    title?: string
  }
  queryKey?: string // use document query key if not provided
  image?: ImageDocumentElement // use main image element if not provided
  showCount?: boolean
}
