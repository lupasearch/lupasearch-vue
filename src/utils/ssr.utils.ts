import lupaSearchSdk from '@getlupa/client-sdk'
import { SearchResultsOptions } from '..'
import { parseParams } from './params.utils'
import { createPublicQuery, getPublicQuery } from './query.utils'
import { FilterGroup } from '@getlupa/client-sdk/Types'

export const getSearchParams = (
  url?: string,
  params?: URLSearchParams,
  baseUrl?: string
): URLSearchParams => {
  let searchParams: URLSearchParams
  if (typeof window !== 'undefined') {
    // Client side
    searchParams = params || new URLSearchParams(window.location.search)
  } else {
    // Server side
    if (url) {
      searchParams = params || new URLSearchParams(new URL(url, baseUrl).search)
    } else {
      throw new Error('LupaSaerch: ssr.url is required on the server side')
    }
  }
  return searchParams
}

export const getInitialSearchResults = async (
  options: SearchResultsOptions,
  defaultData?: {
    filters?: FilterGroup
    pageSize?: number
  }
) => {
  const searchParams = getSearchParams(options.ssr?.url, undefined, options.ssr?.baseUrl)
  const publicQuery = createPublicQuery(
    parseParams(searchParams),
    options.sort,
    defaultData?.pageSize
  )
  const query = getPublicQuery(publicQuery, defaultData?.filters ?? {}, false)
  try {
    const result = await lupaSearchSdk.query(options.queryKey, query, options.options)
    return result
  } catch (e) {
    options.options.onError(e)
  }
}
