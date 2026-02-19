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
  const { searchResult, relatedQueriesResult, loading, loadingRelatedQueries } =
    storeToRefs(searchResultStore)
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

  const loadingAny = computed(() => {
    return loading.value || loadingRelatedQueries.value
  })

  return {
    loading,
    loadingRelatedQueries,
    loadingAny,
    limit,
    skeletonEnabled,
    relatedQueriesSkeletonEnabled
  }
}
