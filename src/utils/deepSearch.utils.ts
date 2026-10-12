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

export const getDeepSearchFilterParams = (
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

// SDK types do not include `deepSearch` yet; the SDK sends modifiers as they are
export type QueryModifiers = NonNullable<PublicQuery['modifiers']> & { deepSearch?: boolean }

export const withDeepSearchModifier = (
  modifiers?: QueryModifiers,
  deepSearch?: boolean
): QueryModifiers | undefined => {
  if (deepSearch === undefined) {
    return modifiers
  }
  return { ...modifiers, deepSearch }
}

export const withDeepSearchMetadata = (
  metadata: Record<string, unknown> | undefined,
  deepSearch: boolean
): Record<string, unknown> | undefined => {
  return deepSearch ? { ...metadata, deepSearch: true } : metadata
}

export const areDeepSearchFiltersApplied = (
  aiFilters: FilterGroup = {},
  currentFilters: FilterGroup = {}
): boolean => {
  return getDeepSearchFilterParams(aiFilters).every((param) => {
    const key = param.name.slice(param.name.indexOf('.') + 1)
    const current = currentFilters[key]
    if (Array.isArray(param.value)) {
      const currentTerms = getCurrentTerms(current)
      return param.value.every((value) => currentTerms.includes(value))
    }
    if (!current || Array.isArray(current) || isHierarchyFilter(current)) {
      return false
    }
    const isPartial = param.name.startsWith(FACET_PARAMS_TYPE.PARTIAL_RANGE)
    const max = isPartial ? current.lt : current.lte
    return `${current.gte ?? ''}${FACET_RANGE_SEPARATOR}${max ?? ''}` === param.value
  })
}
