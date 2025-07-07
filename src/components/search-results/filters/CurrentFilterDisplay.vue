<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import type { LabeledFilter } from '@/types/search-results/Filters'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { formatPriceSummary, MultiCurrencyConfig } from '@/utils/price.utils'
import { SEARCH_RESULTS_CONFIGURATION } from '@/constants/development/searchResultsDev.const'

const props = defineProps<{ filter: LabeledFilter }>()
const emit = defineEmits<{ (e: 'remove', payload: { filter: LabeledFilter }): void }>()
const facetKeyClass = computed(() => `lupa-facet-active-filter-${props.filter.key}`)

const multiCurrencyConfig = computed<MultiCurrencyConfig>(() => ({
  selected: SEARCH_RESULTS_CONFIGURATION.selected,
  currencies: SEARCH_RESULTS_CONFIGURATION.currencies
}))

const { searchResultOptions } = storeToRefs(useOptionsStore())
const units = computed(() => searchResultOptions.value.filters.facets.stats.units ?? {})

function handleClick(): void {
  emit('remove', { filter: props.filter })
}

function formatFilterValue(filter: LabeledFilter): string {
  const unit = units.value[filter.key] || ''
  let min: string | undefined, max: string | undefined

  if (Array.isArray(filter.value)) {
    ;[min, max] = filter.value.map(String)
  } else if (typeof filter.value === 'string' && filter.value.includes('-')) {
    const parts = filter.value.split('-').map((s) => s.trim())
    if (parts.length === 2) [min, max] = parts
  }

  if (min != null && max != null) {
    return `${min} ${unit} – ${max} ${unit}`
  }
  return `${filter.value} ${unit}`.trim()
}

const displayValue = computed<string>(() => {
  const f = props.filter
  let minNum: number | null = null
  let maxNum: number | null = null

  if (Array.isArray(f.value)) {
    minNum = Number(f.value[0])
    maxNum = Number(f.value[1])
  } else if (typeof f.value === 'string' && f.value.includes('-')) {
    const [a, b] = f.value.split('-').map((s) => parseFloat(s.trim()))
    minNum = a
    maxNum = b
  } else if (typeof f.value === 'object') {
    ;({ gte: minNum, lte: maxNum } = f.value as any)
  }
  if (minNum != null && maxNum != null && multiCurrencyConfig.value.currencies?.length) {
    return formatPriceSummary([minNum, maxNum], '', '', '', multiCurrencyConfig.value)
  }
  return formatFilterValue(f)
})
</script>

<template>
  <div
    class="lupa-search-result-filter-value"
    :class="[facetKeyClass]"
    data-cy="lupa-current-filter-item"
  >
    <div class="lupa-current-filter-action" @click="handleClick" aria-label="Remove filter">⨉</div>

    <div class="lupa-current-filter-label" data-cy="lupa-current-filter-label">
      {{ filter.label }}:
    </div>
    <div class="lupa-current-filter-value" data-cy="lupa-current-filter-value">
      {{ displayValue }}
    </div>
  </div>
</template>
