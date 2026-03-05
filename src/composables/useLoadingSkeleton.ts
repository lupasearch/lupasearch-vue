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

  const skeletonEnabled = computed(() => {
    return searchResultOptions.value?.loadingSkeleton?.enabled && !searchResult.value?.items?.length
  })

  const relatedQueriesSkeletonEnabled = computed(() => {
    return (
      searchResultOptions.value?.loadingSkeleton?.enabled &&
      Boolean(searchResultOptions.value?.relatedQueries) &&
      !relatedQueriesResult.value?.relatedQueries?.length
    )
  })

  const facetSkeletonEnabled = computed(() => {
    return (
      searchResultOptions.value?.loadingSkeleton?.enabled && !searchResult.value?.facets?.length
    )
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
