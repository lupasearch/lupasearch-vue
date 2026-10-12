import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { DEFAULT_OPTIONS_RESULTS } from '@/constants/searchResults.const'
import { parseSerializedSort } from '@/utils/sort.utils'
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import { SearchResultsSortOptions } from '@/types/search-results/SearchResultsSort'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

export const useSorting = () => {
  const paramStore = useParamsStore()
  const optionStore = useOptionsStore()

  const { sort } = storeToRefs(paramStore)
  const { ariaLabels, searchResultOptions } = storeToRefs(optionStore)

  const selectedKey = ref('')
  const previousKey = ref('')

  const sortStyle = computed(() => {
    return searchResultOptions.value.sortStyle
  })

  const sortOptions = computed((): SearchResultsSortOptions[] | undefined => {
    return searchResultOptions.value.sort
  })

  const callbacks = computed(() => {
    return searchResultOptions.value.callbacks
  })

  const sotyByTitleLabel = computed(() => {
    return searchResultOptions.value.labels?.sortBy
  })

  // URL sort with no configured key, e.g. suggested by deep search
  const suggestedSortItem = computed((): SearchResultsSortOptions | undefined => {
    if (!sort.value || sortOptions.value?.some((x) => x.key === sort.value)) {
      return undefined
    }
    const config = parseSerializedSort(sort.value)
    if (!config) {
      return undefined
    }
    return {
      key: sort.value,
      label:
        searchResultOptions.value.labels?.suggestedSort ??
        DEFAULT_OPTIONS_RESULTS.labels.suggestedSort,
      config
    }
  })

  const sortItems = computed((): SearchResultsSortOptions[] => {
    const items = sortOptions.value?.length ? sortOptions.value : []
    return suggestedSortItem.value ? [...items, suggestedSortItem.value] : items
  })

  const defaultSortValue = computed((): SearchResultsSortOptions => {
    return sortOptions.value?.find((x) => x.default) ?? sortItems.value?.[0]
  })

  const setSortValue = (): void => {
    const optionToSelect = sortItems.value.find((x) => x.key === sort.value)?.key
    selectedKey.value = optionToSelect ?? defaultSortValue.value?.key
    previousKey.value = selectedKey.value
  }

  watch(sort, () => setSortValue())
  watch(sortOptions, () => setSortValue())

  const handleSelect = (): void => {
    const value = sortItems.value.find((x) => x.key === selectedKey.value)?.key
    if (!value) {
      return
    }
    paramStore.setSortSettings({ selectedSortKey: value, previousSortKey: previousKey.value })
    callbacks.value?.onSortChange?.({ selectedSortKey: value, previousSortKey: previousKey.value })
    paramStore.appendParams({
      params: [{ name: optionStore.getQueryParamName(QUERY_PARAMS.SORT), value }],
      paramsToRemove: [optionStore.getQueryParamName(QUERY_PARAMS.PAGE)]
    })
    previousKey.value = selectedKey.value
  }

  return {
    sort,
    sotyByTitleLabel,
    sortItems,
    selectedKey,
    previousKey,
    ariaLabels,
    sortOptions,
    sortStyle,
    defaultSortValue,
    handleSelect,
    setSortValue
  }
}
