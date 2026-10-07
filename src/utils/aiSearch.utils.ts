import { FACET_PARAMS_TYPE, FACET_RANGE_SEPARATOR } from '@/constants/queryParams.const'
import type {
  FilterGroup,
  FilterGroupItem,
  FilterGroupItemTypeHierarchy,
  FilterGroupItemTypeRange,
  PublicQuery
} from '@getlupa/client-sdk/Types'
import { getFacetParam } from './filter.toggle.utils'

type UrlParam = { name: string; value: string | string[] }

const isHierarchyFilter = (filter: FilterGroupItem): filter is FilterGroupItemTypeHierarchy => {
  return !Array.isArray(filter) && Array.isArray((filter as FilterGroupItemTypeHierarchy).terms)
}

const getCurrentTerms = (filter?: FilterGroupItem): string[] => {
  if (!filter) {
    return []
  }
  if (Array.isArray(filter)) {
    return filter.map(String)
  }
  return isHierarchyFilter(filter) ? filter.terms.map(String) : []
}

const mergeTerms = (current: string[], added: unknown[]): string[] => {
  return Array.from(new Set([...current, ...added.map(String)]))
}

const getRangeParam = (key: string, range: FilterGroupItemTypeRange): UrlParam | undefined => {
  const min = range.gte ?? range.gt ?? ''
  const isPartial = range.lt !== undefined && range.lte === undefined
  const max = (isPartial ? range.lt : (range.lte ?? range.lt)) ?? ''
  if (min === '' && max === '') {
    return undefined
  }
  return getFacetParam(
    key,
    `${min}${FACET_RANGE_SEPARATOR}${max}`,
    isPartial ? FACET_PARAMS_TYPE.PARTIAL_RANGE : FACET_PARAMS_TYPE.RANGE
  )
}

/**
 * URL params for filters added by AI search. Term and hierarchy values are merged with the values
 * already in the URL, ranges replace the current range.
 */
export const getAiSearchFilterParams = (
  aiFilters: FilterGroup = {},
  currentFilters: FilterGroup = {}
): UrlParam[] => {
  const params: UrlParam[] = []
  for (const [key, filter] of Object.entries(aiFilters)) {
    if (!filter) {
      continue
    }
    if (Array.isArray(filter)) {
      params.push(getFacetParam(key, mergeTerms(getCurrentTerms(currentFilters[key]), filter)))
      continue
    }
    if (isHierarchyFilter(filter)) {
      params.push(
        getFacetParam(
          key,
          mergeTerms(getCurrentTerms(currentFilters[key]), filter.terms),
          FACET_PARAMS_TYPE.HIERARCHY
        )
      )
      continue
    }
    const rangeParam = getRangeParam(key, filter)
    if (rangeParam) {
      params.push(rangeParam)
    }
  }
  return params
}

// SDK types do not include `aiSearch` yet; the SDK sends modifiers as they are
export type QueryModifiers = NonNullable<PublicQuery['modifiers']> & { aiSearch?: boolean }

/** Adds the `aiSearch` modifier when it is set. Undefined when there is nothing to send */
export const withAiSearchModifier = (
  modifiers?: QueryModifiers,
  aiSearch?: boolean
): QueryModifiers | undefined => {
  if (aiSearch === undefined) {
    return modifiers
  }
  return { ...modifiers, aiSearch }
}

/** Adds `aiSearch: true` to click tracking metadata when results are AI search results */
export const withAiSearchMetadata = (
  metadata: Record<string, unknown> | undefined,
  aiSearch: boolean
): Record<string, unknown> | undefined => {
  return aiSearch ? { ...metadata, aiSearch: true } : metadata
}
