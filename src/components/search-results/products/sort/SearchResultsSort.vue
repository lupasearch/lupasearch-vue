<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useParamsStore } from '@/stores/params'
import type {
  SearchResultsSortOptions,
  SortOptions
} from '@/types/search-results/SearchResultsSort'
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import {
  SearchResultEventCallbacks,
  SearchResultsOptionLabels
} from '@/types/search-results/SearchResultsOptions'
import { useOptionsStore } from '@/stores/options'

const props = defineProps<{
  options: SortOptions
  callbacks?: SearchResultEventCallbacks
}>()

const paramStore = useParamsStore()
const optionStore = useOptionsStore()

const { sort } = storeToRefs(paramStore)
const { ariaLabels } = storeToRefs(optionStore)

const selectedKey = ref('')
const previousKey = ref('')

const sortItems = computed((): SearchResultsSortOptions[] => {
  if (props.options.options && props.options.options.length) {
    return props.options.options
  } else {
    return []
  }
})

const defaultSortValue = computed((): SearchResultsSortOptions => {
  return props.options.options.find((x) => x.default) ?? props.options.options[0]
})

const setSortValue = (): void => {
  const optionToSelect = sortItems.value.find((x) => x.key === sort.value)?.key
  selectedKey.value = optionToSelect ?? defaultSortValue.value?.key
  previousKey.value = selectedKey.value
}

watch(sort, () => setSortValue())

onMounted(() => {
  setSortValue()
})

const handleSelect = (): void => {
  const value = sortItems.value.find((x) => x.key === selectedKey.value)?.key
  if (!value) {
    return
  }
  paramStore.setSortSettings({ selectedSortKey: value, previousSortKey: previousKey.value })
  props.callbacks?.onSortChange?.({ selectedSortKey: value, previousSortKey: previousKey.value })
  paramStore.appendParams({
    params: [{ name: optionStore.getQueryParamName(QUERY_PARAMS.SORT), value }],
    paramsToRemove: [optionStore.getQueryParamName(QUERY_PARAMS.PAGE)]
  })
  previousKey.value = selectedKey.value
}
</script>
<template>
  <div id="lupa-search-results-sort" class="lupa-search-results-sort">
    <div id="lupa-select">
      <label class="lupa-select-label" for="lupa-sort-select-dropdown">{{ options.label }}</label>
      <select
        id="lupa-sort-select-dropdown"
        class="lupa-select-dropdown"
        :aria-label="ariaLabels?.sortBySelect ?? options.label"
        data-cy="lupa-sort-select-dropdown"
        v-model="selectedKey"
        @change="handleSelect"
        ref="select"
      >
        <option v-for="option in sortItems" :key="option.key" :value="option.key">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>
