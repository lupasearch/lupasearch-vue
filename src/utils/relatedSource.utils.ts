import {
  RelatedQueryFacetsSource,
  RelatedQuerySource,
  RelatedQuerySourceType
} from '@/types/search-results/RelatedQueryOptions'
import type { FacetGroup, FacetGroupHierarchy, SearchQueryResult } from '@getlupa/client-sdk/Types'

const extractFacetsRelatedSource = (
  source: RelatedQueryFacetsSource,
  searchResults: SearchQueryResult
): string[] => {
  const facet = searchResults.facets?.find((facet) => facet.key === source.key)
  if (!facet) {
    return []
  }
  if (facet.type === 'terms') {
    return (facet as FacetGroup).items?.slice(0, source.count)?.map((item) => item.title)
  }
  if (facet.type === 'hierarchy') {
    return (facet as FacetGroupHierarchy).items?.slice(0, source.count)?.map((item) => item.title)
  }
  return []
}

export const extractRelatedSource = (
  source: RelatedQuerySource,
  searchResults: SearchQueryResult
): string[] => {
  switch (source.type) {
    case RelatedQuerySourceType.FACETS:
      return extractFacetsRelatedSource(source, searchResults)
  }
}
