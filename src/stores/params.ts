import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { QueryParams } from '@/types/search-results/QueryParams'
import { DEFAULT_PAGE_SIZE } from '@/constants/global.const'
import { QUERY_PARAMS, QUERY_PARAMS_PARSED } from '@/constants/queryParams.const'
import { useOptionsStore } from './options'
import { getPageUrl, redirectToResultsPage } from '@/utils/routing.utils'
import { isFacetKey } from '@/utils/filter.utils'
import { appendParam, getRemovableParams, parseParams, removeParams } from '@/utils/params.utils'
import type { InputSuggestionFacet } from '@/types/search-box/Common'
import { linksMatch } from '@/utils/link.utils'
import { getFacetParam } from '@/utils/filter.toggle.utils'

export const useParamsStore = defineStore('params', () => {
  const params: Ref<QueryParams> = ref({})
  const defaultLimit = ref(DEFAULT_PAGE_SIZE)

  const searchResultsLink = ref('')
  const searchString = ref('')

  const optionsStore = useOptionsStore()

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

  const add = (newParams: QueryParams) => {
    if (!newParams) {
      return { params: params.value }
    }
    const url = getPageUrl()
    params.value = newParams
    searchString.value = url.search
  }

  const removeAllFilters = () => {
    const url = getPageUrl()
    const paramsToRemove = Array.from(url.searchParams.keys()).filter(isFacetKey)
    removeParams(url, paramsToRemove)
    window.history.pushState('', 'Append params', url.pathname + url.search)
    params.value = parseParams(url.searchParams)
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
    paramsToRemove = getRemovableParams(url, paramsToRemove)
    removeParams(url, paramsToRemove)
    window.history.pushState('', 'Append params', url.pathname + url.search)
    if (!save) {
      return
    }

    params.value = parseParams(url.searchParams)
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
    if (!searchResultsLink.value || linksMatch(searchResultsLink.value, window.location.pathname)) {
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
      appendParams({
        params: [{ name: QUERY_PARAMS.QUERY, value: searchText }, ...facetParam],
        paramsToRemove: 'all',
        searchResultsLink: searchResultsLink.value
      })
    } else {
      const routing = optionsStore.boxRoutingBehavior ?? 'direct-link'
      redirectToResultsPage(searchResultsLink.value, searchText, facet, routing)
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
    paramsToRemove = getRemovableParams(url, paramsToRemove)
    removeParams(url, paramsToRemove)
    newParams.forEach((p) => appendParam(url, p, encode))
    window.history.pushState('', 'Append params', url.pathname + url.search)
    if (!save) {
      return
    }
    params.value = parseParams(url.searchParams)
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
    add,
    removeAllFilters,
    removeParameters,
    handleNoResultsFlag,
    goToResults,
    appendParams,
    setDefaultLimit,
    setSearchResultsLink
  }
})
