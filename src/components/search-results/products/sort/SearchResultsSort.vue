<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useParamsStore } from '@/stores/params'
import type {
  SearchResultsSortOptions,
  SortOptions
} from '@/types/search-results/SearchResultsSort'
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { SearchResultEventCallbacks } from '@/types/search-results/SearchResultsOptions'

const props = defineProps<{
  options: SortOptions
  callbacks?: SearchResultEventCallbacks
}>()

const paramStore = useParamsStore()
const { sort } = storeToRefs(paramStore)

const selectedKey = ref('')

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
  props.callbacks?.onSortChange?.({ selectedSortKey: value })
  paramStore.appendParams({
    params: [{ name: QUERY_PARAMS.SORT, value }],
    paramsToRemove: [QUERY_PARAMS.PAGE]
  })
}
</script>
<template>
  <div id="lupa-search-results-sort" class="lupa-search-results-sort">
    <div id="lupa-select">
      <label class="lupa-select-label">{{ options.label }}</label>
      <select
        class="lupa-select-dropdown"
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
