import {
  FACET_FILTER_MAP,
  FACET_PARAMS_TYPE,
  FACET_RANGE_SEPARATOR,
  HIERARCHY_SEPARATOR,
  QUERY_PARAMS
} from '@/constants/queryParams.const'
import type {
  HierarchyFacetAction,
  RangeFacetAction,
  TermFacetAction
} from '@/types/search-results/FacetAction'
import type { FilterType } from '@/types/search-results/Filters'
import type {
  FilterGroup,
  FilterGroupItemTypeHierarchy,
  FilterGroupItemTypeRange,
  FilterGroupItemTypeTerms
} from '@getlupa/client-sdk/Types'
import { getMostSpecificHierarchyTerms, rangeFilterToString } from './filter.utils'

type AppendParams = ({
  params,
  paramsToRemove,
  encode
}: {
  params: { name: string; value: string | string[] }[]
  paramsToRemove?: string[]
  encode?: boolean
}) => unknown

export const getFacetKey = (key: string, type: FilterType): string => {
  return `${FACET_FILTER_MAP[type]}${key}`
}

export const getFacetParam = (
  key: string,
  value: string[] | string,
  type = FACET_PARAMS_TYPE.TERMS
): { name: string; value: string[] | string } => {
  return {
    name: `${type}${key}`,
    value
  }
}

export const toggleTermFilter = (
  appendParams: AppendParams,
  facetAction: TermFacetAction,
  currentFilters?: FilterGroup
): void => {
  const currentFilter = currentFilters?.[facetAction.key] as FilterGroupItemTypeTerms
  const newParams = toggleTermParam(currentFilter, facetAction.value)
  appendParams({
    params: [getFacetParam(facetAction.key, newParams)],
    paramsToRemove: [QUERY_PARAMS.PAGE]
  })
}

export const toggleHierarchyFilter = (
  appendParams: AppendParams,
  facetAction: HierarchyFacetAction,
  currentFilters?: FilterGroup,
  removeAllLevels = false
): void => {
  const currentFilter = currentFilters?.[facetAction.key] as FilterGroupItemTypeHierarchy
  const newParams = toggleHierarchyParam(
    currentFilter?.terms ?? [],
    facetAction.value,
    removeAllLevels
  )
  appendParams({
    params: [getFacetParam(facetAction.key, newParams, FACET_PARAMS_TYPE.HIERARCHY)],
    paramsToRemove: [QUERY_PARAMS.PAGE]
  })
}

export const toggleRangeFilter = (
  appendParams: AppendParams,
  facetAction: RangeFacetAction,
  currentFilters?: FilterGroup
): void => {
  const currentFilter = rangeFilterToString(
    currentFilters?.[facetAction.key] as FilterGroupItemTypeRange,
    FACET_RANGE_SEPARATOR
  )
  let facetValue = facetAction.value.join(FACET_RANGE_SEPARATOR)
  facetValue = currentFilter === facetValue ? '' : facetValue
  appendParams({
    params: [getFacetParam(facetAction.key, facetValue, FACET_PARAMS_TYPE.RANGE)],
    paramsToRemove: [QUERY_PARAMS.PAGE],
    encode: false
  })
}

export const toggleTermParam = (params: string[] = [], param = ''): string[] => {
  if (params?.includes(param)) {
    return params.filter((p) => p !== param)
  }
  return [param, ...params]
}

export const toggleLastPram = (params: string[] = [], param = ''): string[] => {
  const paramLevel = param.split('>').length
  return getMostSpecificHierarchyTerms(
    params
      .map((p) =>
        p.startsWith(param)
          ? p
              .split(HIERARCHY_SEPARATOR)
              .slice(0, paramLevel - 1)
              .join(HIERARCHY_SEPARATOR)
              .trim()
          : p
      )
      .filter(Boolean)
  )
}

export const toggleHierarchyParam = (
  params: string[] = [],
  param = '',
  removeAllLevels = false
): string[] => {
  if (params?.some((p) => p.startsWith(param))) {
    return removeAllLevels
      ? getMostSpecificHierarchyTerms(params.filter((p) => !p.startsWith(param)))
      : toggleLastPram(params, param)
  }
  return getMostSpecificHierarchyTerms([param, ...params])
}
