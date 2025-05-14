import { SdkOptions } from '@/types/General'
import {
  RelatedQueryFacetsSource,
  RelatedQueryFacetsSourceQuery,
  RelatedQuerySource,
  RelatedQuerySourceType
} from '@/types/search-results/RelatedQueryOptions'
import type {
  FacetGroup,
  FacetGroupHierarchy,
  FilterGroup,
  SearchQueryResult
} from '@getlupa/client-sdk/Types'
import lupaSearchSdk from '@getlupa/client-sdk'
const combineIdenticalValues = (
  results: {
    key: string
    value: string
  }[]
): {
  key: string
  value: string
}[] => {
  const result: { key: string; value: string }[] = []
  const keys = new Set<string>()
  for (const item of results) {
    const trimmedValue = item.value.trim().toLowerCase()
    if (!keys.has(trimmedValue)) {
      keys.add(trimmedValue)
      result.push({ key: item.key, value: item.value.trim() })
    }
  }
  return result
}

const processFacetsRelatedSourceSuggestionQuery = async (
  searchText: string,
  querySource: RelatedQueryFacetsSourceQuery,
  options: SdkOptions,
  activeFilters?: FilterGroup
): Promise<{ key: string; value: string }[]> => {
  if (Object.keys(activeFilters ?? {})?.length) {
    return []
  }
  const lupaQuery = {
    searchText: searchText,
    limit: 1,
    trackTerm: false
  }
  try {
    const result = await lupaSearchSdk.suggestions(querySource.queryKey, lupaQuery, options)
    if (
      !result.success ||
      result.items?.[0].suggestion?.toLocaleLowerCase() !== searchText?.toLocaleLowerCase()
    ) {
      return []
    }
    return (
      result.items?.[0].facets?.[querySource.facetKey]
        ?.map((item) => ({
          key: querySource.facetKey,
          value: item.title
        }))
        ?.slice(0, querySource.maxCount ?? 5) ?? []
    )
  } catch (error) {
    return []
  }
}

const processFacetsRelatedSourceDocumentQuery = async (
  searchText: string,
  querySource: RelatedQueryFacetsSourceQuery,
  options: SdkOptions,
  activeFilters?: FilterGroup
): Promise<{ key: string; value: string }[]> => {
  const lupaQuery = {
    searchText: searchText,
    limit: 1,
    filters: activeFilters,
    trackTerm: false,
    modifiers: {
      refiners: false
    }
  }
  try {
    const result = await lupaSearchSdk.query(querySource.queryKey, lupaQuery, options)
    if (!result.success) {
      return []
    }
    return extractFacetsRelatedSourceFromOriginalQuery(
      {
        type: RelatedQuerySourceType.FACETS,
        key: querySource.facetKey,
        count: querySource.maxCount
      },
      result
    )
  } catch (error) {
    return []
  }
}

const processFacetsRelatedSourceQuery = async (
  searchText: string,
  query: RelatedQueryFacetsSourceQuery,
  options: SdkOptions,
  activeFilters?: FilterGroup
): Promise<{ key: string; value: string }[]> => {
  switch (query.type) {
    case 'document':
      return processFacetsRelatedSourceDocumentQuery(searchText, query, options, activeFilters)
    case 'suggestion':
      return processFacetsRelatedSourceSuggestionQuery(searchText, query, options, activeFilters)
  }
}

const extractFacetsRelatedSource = async (
  source: RelatedQueryFacetsSource,
  searchResults: SearchQueryResult,
  options: SdkOptions,
  activeFilters?: FilterGroup
): Promise<{ key: string; value: string }[]> => {
  if (!source.queries?.length) {
    return extractFacetsRelatedSourceFromOriginalQuery(source, searchResults)
  }
  const promises = source.queries.map((query) =>
    processFacetsRelatedSourceQuery(searchResults.searchText, query, options, activeFilters)
  )
  const result = (await Promise.all(promises)).flat()
  return combineIdenticalValues(result)?.slice(0, source.count)
}

const extractFacetsRelatedSourceFromOriginalQuery = async (
  source: RelatedQueryFacetsSource,
  searchResults: SearchQueryResult
): Promise<{ key: string; value: string }[]> => {
  const facet = searchResults.facets?.find((facet) => facet.key === source.key)
  if (!facet) {
    return []
  }
  if (facet.type === 'terms') {
    return (facet as FacetGroup).items
      ?.slice(0, source.count)
      ?.map((item) => ({ key: source.key, value: item.title }))
  }
  if (facet.type === 'hierarchy') {
    return (facet as FacetGroupHierarchy).items
      ?.slice(0, source.count)
      ?.map((item) => ({ key: source.key, value: item.title }))
  }
  return []
}

export const extractRelatedSource = async (
  source: RelatedQuerySource,
  searchResults: SearchQueryResult,
  options: SdkOptions,
  activeFilters?: FilterGroup
): Promise<{ key: string; value: string }[]> => {
  if (!source) {
    return []
  }
  switch (source.type) {
    case RelatedQuerySourceType.FACETS:
      return extractFacetsRelatedSource(source, searchResults, options, activeFilters)
  }
}
