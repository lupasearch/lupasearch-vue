import { QUERY_PARAMS } from '@/constants/queryParams.const'
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

  const sortItems = computed((): SearchResultsSortOptions[] => {
    if (sortOptions.value && sortOptions.value.length) {
      return sortOptions.value
    } else {
      return []
    }
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
    sotyByTitleLabel,
    sortItems,
    selectedKey,
    ariaLabels,
    sortOptions,
    sortStyle,
    handleSelect,
    setSortValue
  }
}
