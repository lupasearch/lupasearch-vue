import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export const useLoadingSkeleton = () => {
  const paramsStore = useParamsStore()
  const optionsStore = useOptionsStore()
  const searchResultStore = useSearchResultStore()

  const { limit } = storeToRefs(paramsStore)
  const {
    searchResult,
    relatedQueriesResult,
    loading,
    loadingFacets: loadingFacetsBase,
    loadingRelatedQueries
  } = storeToRefs(searchResultStore)
  const { searchResultOptions } = storeToRefs(optionsStore)

  const enabled = computed(() => {
    return searchResultOptions.value?.loadingSkeleton?.enabled
  })

  const showOnEveryFetch = computed(() => {
    return searchResultOptions.value?.loadingSkeleton?.showOnEveryFetch
  })

  const skeletonEnabled = computed(() => {
    return enabled.value && (!searchResult.value?.items?.length || showOnEveryFetch.value?.results)
  })

  const relatedQueriesSkeletonEnabled = computed(() => {
    return (
      enabled.value &&
      Boolean(searchResultOptions.value?.relatedQueries) &&
      (!relatedQueriesResult.value?.relatedQueries?.length || showOnEveryFetch.value?.relatedQueries)
    )
  })

  const facetSkeletonEnabled = computed(() => {
    return enabled.value && (!searchResult.value?.facets?.length || showOnEveryFetch.value?.facets)
  })

  const loadingFacets = computed(() => {
    if (searchResultOptions.value?.splitExpensiveRequests) {
      return loadingFacetsBase.value
    }
    return loading.value
  })

  const loadingAny = computed(() => {
    return loading.value || loadingRelatedQueries.value || loadingFacets.value
  })

  return {
    loading,
    loadingRelatedQueries,
    loadingFacets,
    loadingAny,
    limit,
    skeletonEnabled,
    relatedQueriesSkeletonEnabled,
    facetSkeletonEnabled
  }
}
