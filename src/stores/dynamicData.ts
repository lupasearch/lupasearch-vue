import { defineStore } from 'pinia'
import { useOptionsStore } from './options'
import { computed, ref, type Ref } from 'vue'
import { Document, SimilarQueryResult, SimilarResults } from '@getlupa/client-sdk/Types'

export const useDynamicDataStore = defineStore('dynamicData', () => {
  const loading = ref(false)
  const dynamicDataIdMap: Ref<Record<string, Document>> = ref({})
  const loadingIds: Ref<Record<string, boolean>> = ref({})

  const optionsStore = useOptionsStore()

  const loadedIds = computed(() => Object.keys(dynamicDataIdMap.value))

  const searchResultOptions = computed(() => optionsStore.searchResultOptions)

  const searchBoxOptions = computed(() => optionsStore.searchBoxOptions)

  const dynamicSearchResultData = computed(() => searchResultOptions.value?.dynamicData)

  const dynamicSearchBoxData = computed(() => searchBoxOptions.value?.dynamicData)

  const isDynamicDataEnabledForSearchResults = computed(
    () => searchResultOptions.value?.dynamicData?.enabled ?? false
  )

  const isDynamicDataEnabledForSearchBox = computed(
    () => searchBoxOptions.value?.dynamicData?.enabled ?? false
  )

  const isCacheEnabled = computed(() => dynamicSearchResultData?.value?.cache ?? false)

  const enhanceSearchResultsWithDynamicData = async ({
    result,
    mode
  }: {
    result?: {
      items: Document[]
      similarQueries?: SimilarQueryResult[]
      similarResults?: SimilarResults
    }
    mode?: 'searchBox' | 'searchResults'
  }) => {
    const enabledForMode =
      mode === 'searchBox'
        ? isDynamicDataEnabledForSearchBox.value
        : isDynamicDataEnabledForSearchResults.value
    if (!result || !enabledForMode) {
      return
    }
    const resultIds = (result?.items?.map((i) => i.id) as string[]) ?? []
    const similarQueryResultIds =
      result.similarQueries?.map((q) => q.items.map((i) => i.id) as string[])?.flat() ?? []
    const similarResultIds = (result.similarResults?.items.map((i) => i.id) as string[]) ?? []
    let requestedIds = [...resultIds, ...similarQueryResultIds, ...similarResultIds]
    if (isCacheEnabled.value) {
      requestedIds = requestedIds.filter((i) => !dynamicDataIdMap.value[`${i}`])
    }
    if (!requestedIds.length) {
      return
    }
    loadingIds.value = requestedIds.reduce((a, c) => ({ ...a, [c]: true }), {})
    loading.value = true
    try {
      const dynamicData = dynamicSearchResultData.value || dynamicSearchBoxData.value
      if (!dynamicData?.handler) {
        return {}
      }
      const dynamicDataResult = (await dynamicData?.handler(requestedIds)) ?? []
      const seed: Record<string, Document> = {}
      const dynamicDataIdMapValue = dynamicDataResult.reduce(
        (a, c) => ({ ...a, [`${c.id}` as string]: c }),
        seed
      ) as Record<string, Document>
      dynamicDataIdMap.value = {
        ...dynamicDataIdMap.value,
        ...dynamicDataIdMapValue
      }
    } finally {
      loading.value = false
      loadingIds.value = {}
    }
  }

  return { dynamicDataIdMap, loading, loadingIds, enhanceSearchResultsWithDynamicData }
})
