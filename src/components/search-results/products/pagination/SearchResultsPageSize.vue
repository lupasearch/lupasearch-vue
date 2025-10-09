<script lang="ts" setup>
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import type { PaginationPageSize } from '@/types/search-results/PaginationOptions'
import { computed, ref } from 'vue'
import type { SearchResultsPaginationLabels } from '@/types/search-results/SearchResultsPagination'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  labels: SearchResultsPaginationLabels
  options: PaginationPageSize
}>()

const paramsStore = useParamsStore()
const optionsStore = useOptionsStore()

const { ariaLabels } = storeToRefs(optionsStore)

const select = ref(null)

const prefixLabel = computed(() => props.labels?.pageSizePrefix ?? '')

const label = computed(() => props.labels?.pageSize ?? '')

const sizes = computed(() => props.options.sizes)

const handleSelect = (e: Event): void => {
  const value = (e.target as HTMLSelectElement).value
  paramsStore.appendParams({
    params: [{ name: optionsStore.getQueryParamName(QUERY_PARAMS.LIMIT), value: value }],
    paramsToRemove: [optionsStore.getQueryParamName(QUERY_PARAMS.PAGE)]
  })
}
</script>

<template>
  <div id="lupa-search-results-page-size" data-cy="lupa-search-results-page-size">
    <div id="lupa-select">
      <label class="lupa-select-label" for="lupa-page-size-select-dropdown">{{ label }}</label>
      <select
        id="lupa-page-size-select-dropdown"
        class="lupa-select-dropdown"
        :aria-label="ariaLabels?.pageSizeSelect ?? label ?? 'Select page size'"
        data-cy="lupa-page-size-select-dropdown"
        @change="handleSelect"
        ref="select"
      >
        <option v-for="option in sizes" :key="option" :value="option">
          {{ prefixLabel }}{{ option }}
        </option>
      </select>
    </div>
  </div>
</template>
