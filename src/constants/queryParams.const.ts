import { LupaQueryParamName, LupaQueryParamValue } from '@/types/General'

export const QUERY_PARAMS: Record<LupaQueryParamName, LupaQueryParamValue> = {
  QUERY: 'q',
  PAGE: 'p',
  LIMIT: 'l',
  SORT: 's'
}

export const QUERY_PARAMS_PARSED = {
  QUERY: 'query',
  PAGE: 'page',
  LIMIT: 'limit',
  SORT: 'sort'
}

export const FACET_PARAMS_TYPE = {
  TERMS: 'f.',
  RANGE: 'fr.',
  PARTIAL_RANGE: 'fpr.',
  HIERARCHY: 'fh.'
}

export const FACET_FILTER_MAP = {
  terms: FACET_PARAMS_TYPE.TERMS,
  range: FACET_PARAMS_TYPE.RANGE,
  stats: FACET_PARAMS_TYPE.RANGE,
  hierarchy: FACET_PARAMS_TYPE.HIERARCHY,
  partialRange: FACET_PARAMS_TYPE.PARTIAL_RANGE
}

export const FACET_KEY_SEPARATOR = '.'

export const FACET_RANGE_SEPARATOR = ':'
export const HIERARCHY_SEPARATOR = '>'

export const FACET_TERM_RANGE_SEPARATOR = '-'
