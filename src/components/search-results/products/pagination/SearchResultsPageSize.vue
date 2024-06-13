<script lang="ts" setup>
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import type { PaginationPageSize } from '@/types/search-results/PaginationOptions'
import { ref } from 'vue'

defineProps<{
  label: string
  options: PaginationPageSize
}>()

const paramsStore = useParamsStore()
const optionsStore = useOptionsStore()

const select = ref(null)

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
      <label class="lupa-select-label">{{ label }}</label>
      <select
        class="lupa-select-dropdown"
        :aria-label="label"
        data-cy="lupa-page-size-select-dropdown"
        @change="handleSelect"
        ref="select"
      >
        <option v-for="option in options.sizes" :key="option">
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>
