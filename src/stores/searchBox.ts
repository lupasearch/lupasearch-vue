import { ref, computed, type Ref } from 'vue'
import { type PublicQuery, type SearchQueryResult } from '@getlupa/client-sdk/Types'
import lupaSearchSdk from '@getlupa/client-sdk'
import { DEFAULT_SEARCH_BOX_OPTIONS } from '@/constants/searchBox.const'
import type { SearchBoxOptions } from '@/types/search-box/SearchBoxOptions'
import { defineStore } from 'pinia'
import type { DisplaySuggestion } from '@/types/search-box/Common'
import { SearchBoxPanelType } from '@/types/search-box/SearchBoxPanel'
import { generateLink } from '@/utils/link.utils'
import type { SdkOptions } from '@/types/General'
import { getLupaTrackingContext } from '@/utils/tracking.utils'
import { flattenSuggestions } from '@/utils/suggestion.utils'
import { useHistoryStore } from './history'

export const useSearchBoxStore = defineStore('searchBox', () => {
  const options: Ref<SearchBoxOptions> = ref(DEFAULT_SEARCH_BOX_OPTIONS as SearchBoxOptions)
  const docResults: Ref<Record<string, SearchQueryResult>> = ref({})
  const suggestionResults: Ref<Record<string, DisplaySuggestion[]>> = ref({})
  const highlightedIndex = ref(-1)
  const inputValue = ref('')

  const historyStore = useHistoryStore()

  const resultsVisible = computed(() => inputValue.value?.length >= options.value.minInputLength)

  const panelItemCounts = computed(() =>
    options.value.panels.map((p) => {
      if (p.type === SearchBoxPanelType.SUGGESTION) {
        return {
          queryKey: p.queryKey,
          count: suggestionResults.value[p.queryKey]?.length ?? 0,
          panel: p
        }
      }
      return {
        queryKey: p.queryKey,
        count: docResults.value[p.queryKey]?.items?.length ?? 0,
        panel: p
      }
    })
  )

  const totalCount = computed(() =>
    resultsVisible.value
      ? panelItemCounts.value?.reduce((a, c) => a + c.count, 0) ?? 0
      : historyStore.count
  )

  const highlightedItem = computed(() => {
    let i = 0
    for (const panel of panelItemCounts.value) {
      if (highlightedIndex.value < i + panel.count) {
        const mod = highlightedIndex.value - i
        return { queryKey: panel.queryKey, index: mod, panel: panel.panel }
      }
      i += panel.count
    }
  })

  const highlightedDocument = computed(() => {
    if (resultsVisible.value || highlightedItem.value?.panel.type !== SearchBoxPanelType.DOCUMENT) {
      return { doc: undefined }
    }
    const doc = docResults.value[highlightedItem.value.queryKey].items[highlightedItem.value.index]
    const panel = highlightedItem.value.panel
    return {
      doc,
      link: generateLink(panel.links?.details, doc),
      queryKey: panel.queryKey,
      id: panel.idKey ? doc[panel.idKey] : '',
      title: panel.titleKey ? (doc[panel.titleKey] as string) : ''
    }
  })

  const querySuggestions = async ({
    queryKey,
    publicQuery,
    options
  }: {
    queryKey: string
    publicQuery: PublicQuery
    options?: SdkOptions
  }) => {
    try {
      const context = getLupaTrackingContext()
      const result = await lupaSearchSdk.suggestions(
        queryKey,
        { ...publicQuery, ...context },
        options
      )
      if (!result.success) {
        return { suggestions: undefined }
      }
      highlightChange({ action: 'clear' })
      suggestionResults.value = {
        ...suggestionResults.value,
        [queryKey]: flattenSuggestions(result.items, publicQuery.searchText ?? '')
      }
      inputValue.value = publicQuery.searchText
      return {
        suggestions: result.items
      }
    } catch (err) {
      console.error(err)
      if (options?.onError) {
        options.onError(err)
      }
      return { suggestions: undefined }
    }
  }

  const queryDocuments = async ({
    queryKey,
    publicQuery,
    options
  }: {
    queryKey: string
    publicQuery: PublicQuery
    options?: SdkOptions
  }) => {
    try {
      const context = getLupaTrackingContext()
      const result = await lupaSearchSdk.query(queryKey, { ...publicQuery, ...context }, options)
      if (!result.success) {
        return { queryKey, result: { items: [] } }
      }
      highlightChange({ action: 'clear' })
      docResults.value = { ...docResults.value, [queryKey]: result }
      return { queryKey, result }
    } catch (err) {
      console.error(err)
      if (options?.onError) {
        options.onError(err)
      }
      return { queryKey, result: { items: [] } }
    }
  }

  const highlightChange = ({ action }: { action: 'down' | 'up' | 'clear' }) => {
    if (action === 'clear') {
      return { highlightIndex: -1 }
    }
    const newIndex = highlightedIndex.value + (action === 'up' ? -1 : 1)
    highlightedIndex.value = newIndex >= 0 ? newIndex % totalCount.value : totalCount.value - 1
  }

  const saveInputValue = ({ input }: { input: string }) => {
    inputValue.value = input
  }

  const saveOptions = ({ newOptions }: { newOptions: SearchBoxOptions }) => {
    options.value = newOptions
  }

  return {
    options,
    docResults,
    suggestionResults,
    highlightedIndex,
    inputValue,
    resultsVisible,
    panelItemCounts,
    totalCount,
    highlightedItem,
    highlightedDocument,
    querySuggestions,
    queryDocuments,
    highlightChange,
    saveInputValue,
    saveOptions
  }
})
