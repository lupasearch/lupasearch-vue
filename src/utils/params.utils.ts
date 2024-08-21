import {
  FACET_KEY_SEPARATOR,
  FACET_PARAMS_TYPE,
  FACET_RANGE_SEPARATOR,
  QUERY_PARAMS,
  QUERY_PARAMS_PARSED
} from '@/constants/queryParams.const'
import type { QueryParams } from '@/types/search-results/QueryParams'
import { isFacetKey } from './filter.utils'
import { reverseKeyValue } from './picker.utils'
import { LupaQueryParamValue } from '@/types/General'

const parseParam = (key: string, params: URLSearchParams) => {
  const value = params.get(key)
  if (!value) {
    return undefined
  }
  try {
    return decodeURIComponent(value)
  } catch {
    // Invalid parameter, possibly out of LupaSearch plugin scope, return undefined
    return undefined
  }
}

const parseRegularKeys = (
  regularKeys: string[],
  searchParams: URLSearchParams,
  getQueryParamName?: (param: LupaQueryParamValue) => string
) => {
  const params = Object.create({})
  const keys = reverseKeyValue({
    QUERY: getQueryParamName ? getQueryParamName(QUERY_PARAMS.QUERY) : QUERY_PARAMS.QUERY,
    LIMIT: getQueryParamName ? getQueryParamName(QUERY_PARAMS.LIMIT) : QUERY_PARAMS.LIMIT,
    PAGE: getQueryParamName ? getQueryParamName(QUERY_PARAMS.PAGE) : QUERY_PARAMS.PAGE,
    SORT: getQueryParamName ? getQueryParamName(QUERY_PARAMS.SORT) : QUERY_PARAMS.SORT
  })
  for (const key of regularKeys) {
    const rawKey = keys[key] || key
    params[rawKey] = parseParam(key, searchParams)
  }
  return params
}

const parseFacetKey = (key: string, searchParams: URLSearchParams) => {
  if (key.startsWith(FACET_PARAMS_TYPE.TERMS)) {
    return searchParams.getAll(key)?.map((v) => decodeURIComponent(v)) ?? []
  }
  if (key.startsWith(FACET_PARAMS_TYPE.RANGE)) {
    const range = searchParams.get(key)
    if (!range) {
      return {}
    }
    const [min, max] = range.split(FACET_RANGE_SEPARATOR)
    return {
      gte: min,
      lte: max
    }
  }
  if (key.startsWith(FACET_PARAMS_TYPE.HIERARCHY)) {
    return {
      level: 0,
      terms: searchParams.getAll(key)?.map((v) => decodeURIComponent(v)) ?? []
    }
  }
  return []
}

const parseFacetKeys = (facetKeys: string[], searchParams: URLSearchParams) => {
  const params: QueryParams = {}
  params.filters = {}
  for (const key of facetKeys) {
    const parsedKey = key.slice(key.indexOf(FACET_KEY_SEPARATOR) + 1)
    params.filters = {
      ...params.filters,
      [parsedKey]: parseFacetKey(key, searchParams)
    }
  }
  return params
}

export const parseParams = (
  getQueryParamName?: (param: LupaQueryParamValue) => string,
  searchParams?: URLSearchParams
): QueryParams => {
  const params = Object.create({})
  if (!searchParams) return params

  const paramKeys = Array.from(searchParams.keys())
  const facetKeys = paramKeys.filter((k) => isFacetKey(k))
  const regularKeys = paramKeys.filter((k) => !isFacetKey(k))
  const r = {
    [QUERY_PARAMS_PARSED.QUERY]: '',
    ...parseRegularKeys(regularKeys, searchParams, getQueryParamName),
    ...parseFacetKeys(facetKeys, searchParams)
  }
  return r
}

export const appendParam = (
  url: URL,
  { name, value }: { name: string; value: string | string[] },
  encode = true
): void => {
  if (Array.isArray(value)) {
    appendArrayParams(url, { name, value })
  } else {
    appendSingleParam(url, { name, value }, encode)
  }
}

const appendSingleParam = (
  url: URL,
  param: { name: string; value: string },
  encode = true
): void => {
  const valueToAppend = encode ? encodeParam(param.value) : param.value
  if (url.searchParams.has(param.name)) {
    url.searchParams.set(param.name, valueToAppend)
  } else {
    url.searchParams.append(param.name, valueToAppend)
  }
}

const appendArrayParams = (url: URL, param: { name: string; value: string[] }) => {
  url.searchParams.delete(param.name)
  param.value.forEach((v) => url.searchParams.append(param.name, encodeParam(v)))
}

export const getRemovableParams = (
  url: URL,
  getQueryParamName?: (param: LupaQueryParamValue) => string,
  paramsToRemove?: 'all' | string[]
): string[] | undefined => {
  if (paramsToRemove === 'all') {
    const params = {
      QUERY: getQueryParamName ? getQueryParamName(QUERY_PARAMS.QUERY) : QUERY_PARAMS.QUERY,
      LIMIT: getQueryParamName ? getQueryParamName(QUERY_PARAMS.LIMIT) : QUERY_PARAMS.LIMIT,
      PAGE: getQueryParamName ? getQueryParamName(QUERY_PARAMS.PAGE) : QUERY_PARAMS.PAGE,
      SORT: getQueryParamName ? getQueryParamName(QUERY_PARAMS.SORT) : QUERY_PARAMS.SORT
    }
    return [
      ...Object.values(params),
      ...Array.from(url.searchParams.keys()).filter((k) => isFacetKey(k))
    ]
  }
  return paramsToRemove
}

export const removeParams = (url: URL, params: string[] = []): void => {
  for (const param of params) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param)
    }
  }
}

export const encodeParam = (param: string): string => {
  const encoded = encodeURIComponent(param)
  return encoded
    .replace(/%C4%85/g, 'ą')
    .replace(/%C4%8D/g, 'č')
    .replace(/%C4%99/g, 'ę')
    .replace(/%C4%97/g, 'ė')
    .replace(/%C4%AF/g, 'į')
    .replace(/%C5%A1/g, 'š')
    .replace(/%C5%B3/g, 'ų')
    .replace(/%C5%AB/g, 'ū')
    .replace(/%C5%BE/g, 'ž')
    .replace(/%20/g, ' ')
}

export const getQueryParam = (name: string): string | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(name)
  } catch {
    return null
  }
}
