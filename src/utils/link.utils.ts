import { FACET_PARAMS_TYPE, QUERY_PARAMS } from '@/constants/queryParams.const'
import type { InputSuggestionFacet } from '@/types/search-box/Common'
import { encodeParam } from './params.utils'
import { LupaQueryParamValue } from '@/types/General'

const PATH_REPLACE_REGEXP = /{(.*?)}/gm

export const generateLink = (linkPattern: string, document: Record<string, unknown>): string => {
  const matches = linkPattern.match(PATH_REPLACE_REGEXP)
  if (!matches) {
    return linkPattern
  }
  let link = linkPattern
  for (const match of matches) {
    const propertyKey = match.slice(1, match.length - 1)
    const property = (document[propertyKey] || '') as string
    link = link.replace(match, property)
  }
  return link
}

export const generateResultLink = (
  link: string,
  getQueryParamName: (param: LupaQueryParamValue) => string,
  searchText?: string,
  facet?: InputSuggestionFacet
): string => {
  if (!searchText) {
    return link
  }
  const facetParam = facet
    ? `&${FACET_PARAMS_TYPE.TERMS}${encodeParam(facet.key)}=${encodeParam(facet.title)}`
    : ''
  const queryParam = `?${getQueryParamName(QUERY_PARAMS.QUERY)}=${encodeParam(searchText)}`
  return `${link}${queryParam}${facetParam}`
}

export const getPathName = (resultPageLink: string): string => {
  let pathname = window.location.pathname
  if (pathname.charAt(pathname.length - 1) === '/')
    pathname = pathname.substr(0, pathname.length - 1)
  if (resultPageLink.charAt(0) !== '/') pathname += '/'

  pathname += !location.pathname.includes(resultPageLink) ? resultPageLink : ''
  return pathname
}

export const getRelativePath = (link: string): string => {
  try {
    const url = new URL(link)
    const partialUrl = url.toString().substring(url.origin.length)
    return partialUrl.endsWith('/') ? partialUrl.slice(0, partialUrl.length - 1) : partialUrl
  } catch {
    // Invalid url, let's return original string
    return link?.endsWith('/') ? link.slice(0, link.length - 1) : link
  }
}

// Checks if url links match absolutely, or if their relative parts are equal
export const linksMatch = (link1?: string, link2?: string): boolean => {
  if (!link1 || !link2) {
    return false
  }
  return link1 === link2 || getRelativePath(link1) === getRelativePath(link2)
}
