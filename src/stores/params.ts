import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { QueryParams } from '@/types/search-results/QueryParams'
import { DEFAULT_PAGE_SIZE, SKIP_FACET_RELOAD_FOR } from '@/constants/global.const'
import { QUERY_PARAMS, QUERY_PARAMS_PARSED } from '@/constants/queryParams.const'
import { useOptionsStore } from './options'
import { getPageUrl, redirectToResultsPage } from '@/utils/routing.utils'
import { isFacetKey } from '@/utils/filter.utils'
import {
  appendParam,
  encodeParam,
  getQueryParam,
  getRemovableParams,
  parseParams,
  removeParams
} from '@/utils/params.utils'
import type { InputSuggestionFacet } from '@/types/search-box/Common'
import { getSearchResultsLink, linksMatch } from '@/utils/link.utils'
import { getFacetParam } from '@/utils/filter.toggle.utils'
import { SortCallbackContext, SsrOptions } from '..'
import { useRedirectionStore } from './redirections'
import { findChangedParams } from '@/utils/url.utils'

export const useParamsStore = defineStore('params', () => {
  const params: Ref<QueryParams> = ref({})
  const defaultLimit = ref(DEFAULT_PAGE_SIZE)

  const searchResultsLink = ref('')
  const searchString = ref('')

  const optionsStore = useOptionsStore()
  const redirectionStore = useRedirectionStore()

  const lastChangedParams = ref([])

  const skipFacetReload = computed(
    () =>
      lastChangedParams.value?.length &&
      lastChangedParams.value?.every((p) => SKIP_FACET_RELOAD_FOR.includes(p))
  )

  const sortParams = ref({
    selectedSortKey: '',
    previousSortKey: ''
  })

  const query = computed(() => params.value[QUERY_PARAMS_PARSED.QUERY] as string)

  const page = computed(() => {
    const page = Number(params.value[QUERY_PARAMS_PARSED.PAGE]) || 1
    return page <= 0 ? 1 : page
  })

  const limit = computed(() => {
    return (
      Number(params.value[QUERY_PARAMS_PARSED.LIMIT]) ||
      optionsStore.defaultSearchResultPageSize ||
      defaultLimit.value
    )
  })

  const sort = computed(() => {
    return params.value[QUERY_PARAMS_PARSED.SORT] as string
  })

  const filters = computed(() => {
    return params.value.filters ?? {}
  })

  const navigate = (url: URL) => {
    window.history.pushState('', 'Append params', url.pathname + url.search)
    const params = parseParams(optionsStore.getQueryParamName, url.searchParams) as QueryParams & {
      query: string
    }
    optionsStore?.searchBoxOptions?.callbacks?.onSearchResultsNavigate?.({
      params
    })
  }

  const add = (newParams: QueryParams, ssr?: SsrOptions) => {
    if (!newParams) {
      return { params: params.value }
    }
    const url = getPageUrl(undefined, ssr)
    lastChangedParams.value = findChangedParams(params.value, newParams)
    params.value = newParams
    searchString.value = url.search
  }

  const removeAllFilters = () => {
    const url = getPageUrl()
    const paramsToRemove = Array.from(url.searchParams.keys()).filter(isFacetKey)
    removeParams(url, paramsToRemove)
    navigate(url)
    params.value = parseParams(optionsStore.getQueryParamName, url.searchParams)
    searchString.value = url.search
  }

  const removeParameters = ({
    paramsToRemove,
    save = true
  }: {
    paramsToRemove?: 'all' | string[]
    save?: boolean
  }) => {
    const url = getPageUrl()
    paramsToRemove = getRemovableParams(url, optionsStore.getQueryParamName, paramsToRemove)
    removeParams(url, paramsToRemove)
    navigate(url)
    if (!save) {
      return
    }
    lastChangedParams.value = findChangedParams(params.value, {})
    params.value = parseParams(optionsStore.getQueryParamName, url.searchParams)
    searchString.value = url.search
  }

  const handleNoResultsFlag = ({
    resultCount,
    noResultsParam
  }: {
    resultCount: number
    noResultsParam?: string
  }) => {
    if (
      !noResultsParam ||
      (searchResultsLink.value && searchResultsLink.value !== window.location.pathname)
    ) {
      return
    }
    if (resultCount < 1) {
      appendParams({
        params: [{ name: noResultsParam, value: 'true' }],
        save: false
      })
    } else {
      removeParameters({
        paramsToRemove: [noResultsParam],
        save: false
      })
    }
  }

  const goToResults = ({
    searchText,
    facet
  }: {
    searchText: string
    facet?: InputSuggestionFacet
  }) => {
    const redirectionApplied = redirectionStore.redirectOnKeywordIfConfigured(
      searchText,
      optionsStore.boxRoutingBehavior
    )
    if (redirectionApplied) {
      return
    }
    const forceFullReload = optionsStore.searchBoxOptions.forceFullReloadOnParams?.some((p) =>
      getQueryParam(p)
    )
    const currentUrl = getSearchResultsLink(searchResultsLink.value, optionsStore.getQueryParamName)
    if (
      (!searchResultsLink.value || linksMatch(searchResultsLink.value, currentUrl)) &&
      !forceFullReload
    ) {
      const singleFacetParam = facet ? getFacetParam(facet.key, [facet.title]) : undefined
      const facetParam = singleFacetParam
        ? [
            {
              ...singleFacetParam,
              value: Array.isArray(singleFacetParam.value)
                ? singleFacetParam.value[0]
                : singleFacetParam.value
            }
          ]
        : []
      const limitParam = params.value[QUERY_PARAMS_PARSED.LIMIT]
        ? [
            {
              name: optionsStore.getQueryParamName(QUERY_PARAMS.LIMIT),
              value: limit.value.toString()
            }
          ]
        : []
      appendParams({
        params: [
          { name: optionsStore.getQueryParamName(QUERY_PARAMS.QUERY), value: searchText },
          ...limitParam,
          ...facetParam
        ],
        paramsToRemove: 'all',
        searchResultsLink: searchResultsLink.value
      })
    } else {
      const routing = optionsStore.boxRoutingBehavior ?? 'direct-link'
      redirectToResultsPage(
        searchResultsLink.value,
        encodeParam(searchText),
        optionsStore.getQueryParamName,
        facet,
        routing
      )
    }
  }

  const appendParams = ({
    params: newParams,
    paramsToRemove,
    encode = true,
    save = true,
    searchResultsLink
  }: {
    params: { name: string; value: string }[]
    paramsToRemove?: 'all' | string[]
    encode?: boolean
    save?: boolean
    searchResultsLink?: string
  }) => {
    if (!newParams?.length) {
      return { params: params.value }
    }
    const url = getPageUrl(searchResultsLink)
    paramsToRemove = getRemovableParams(url, optionsStore.getQueryParamName, paramsToRemove)
    removeParams(url, paramsToRemove)
    newParams.forEach((p) => appendParam(url, p, encode))
    navigate(url)
    if (!save) {
      return
    }
    const updatedParams = parseParams(optionsStore.getQueryParamName, url.searchParams)
    lastChangedParams.value = findChangedParams(params.value, updatedParams)
    params.value = updatedParams
    searchString.value = url.search
  }

  const setDefaultLimit = (newDefaultLimit: number) => {
    if (!newDefaultLimit) {
      return
    }
    return (defaultLimit.value = newDefaultLimit)
  }

  const setSearchResultsLink = (newSearchResultsLink: string) => {
    if (!newSearchResultsLink) {
      return
    }
    searchResultsLink.value = newSearchResultsLink
  }

  const setSortSettings = ({ selectedSortKey, previousSortKey }: SortCallbackContext) => {
    sortParams.value = {
      selectedSortKey,
      previousSortKey
    }
  }

  return {
    params,
    defaultLimit,
    searchResultsLink,
    searchString,
    query,
    page,
    limit,
    sort,
    filters,
    sortParams,
    lastChangedParams,
    skipFacetReload,
    add,
    removeAllFilters,
    removeParameters,
    handleNoResultsFlag,
    goToResults,
    appendParams,
    setDefaultLimit,
    setSearchResultsLink,
    setSortSettings
  }
})
