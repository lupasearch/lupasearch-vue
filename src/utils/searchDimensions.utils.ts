import { DEFAULT_SEARCH_DIMENSIONS_OPTIONS } from '@/constants/global.const'
import type {
  AbTestDecision,
  AnalyticsSearchDimensions,
  SearchDimensionValues
} from '@/types/AnalyticsOptions'
import type { PublicQuery, SearchQueryResult } from '@getlupa/client-sdk/Types'
import { hasFilterValue } from './deepSearch.utils'

export const resolveSearchDimensionsOptions = (
  options: AnalyticsSearchDimensions = {}
): typeof DEFAULT_SEARCH_DIMENSIONS_OPTIONS => {
  return {
    enabled: options.enabled ?? DEFAULT_SEARCH_DIMENSIONS_OPTIONS.enabled,
    eventName: options.eventName || DEFAULT_SEARCH_DIMENSIONS_OPTIONS.eventName,
    attachToEvents: options.attachToEvents ?? DEFAULT_SEARCH_DIMENSIONS_OPTIONS.attachToEvents,
    keys: { ...DEFAULT_SEARCH_DIMENSIONS_OPTIONS.keys, ...(options.keys ?? {}) }
  }
}

export const getSearchDimensionValues = (
  request: Pick<PublicQuery, 'adjustedSearchText' | 'filters'>,
  response: SearchQueryResult & { abTestDecision?: AbTestDecision }
): SearchDimensionValues => {
  const abTestTriggered = response.abTestDecision?.abTestTriggered === true
  const keptDeepSearchResult =
    typeof request.adjustedSearchText === 'string' &&
    Object.values(request.filters ?? {}).some((filter) => hasFilterValue(filter))
  return {
    abTestTriggered,
    abTestVariant: abTestTriggered ? response.abTestDecision?.selectedQueryKey : undefined,
    deepSearch: response.executionMetadata?.deepSearch?.applied === true || keptDeepSearchResult
  }
}

export const getSearchDimensionParams = (
  values: SearchDimensionValues,
  options?: AnalyticsSearchDimensions
): Record<string, string> => {
  const { keys } = resolveSearchDimensionsOptions(options)
  const params: Record<string, string> = {}
  if (keys.abTestTriggered) {
    params[keys.abTestTriggered] = String(values.abTestTriggered)
  }
  if (keys.abTestVariant) {
    params[keys.abTestVariant] = values.abTestVariant ?? ''
  }
  if (keys.deepSearch) {
    params[keys.deepSearch] = String(values.deepSearch)
  }
  return params
}
