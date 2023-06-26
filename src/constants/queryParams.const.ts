export const QUERY_PARAMS = {
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
  HIERARCHY: 'fh.'
}

export const FACET_FILTER_MAP = {
  terms: FACET_PARAMS_TYPE.TERMS,
  range: FACET_PARAMS_TYPE.RANGE,
  hierarchy: FACET_PARAMS_TYPE.HIERARCHY
}

export const FACET_KEY_SEPARATOR = '.'

export const FACET_RANGE_SEPARATOR = ':'
export const HIERARCHY_SEPARATOR = '>'

export const FACET_TERM_RANGE_SEPARATOR = '-'
