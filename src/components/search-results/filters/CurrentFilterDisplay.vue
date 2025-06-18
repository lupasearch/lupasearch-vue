<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import type { LabeledFilter } from '@/types/search-results/Filters'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { formatPriceSummary } from '@/utils/price.utils'

const props = defineProps<{ filter: LabeledFilter }>()
const emit = defineEmits<{ (e: 'remove', payload: { filter: LabeledFilter }): void }>()

const facetKeyClass = computed(() => `lupa-facet-active-filter-${props.filter.key}`)

const optionsStore = useOptionsStore()

const { searchResultOptions } = storeToRefs(useOptionsStore())
const { multiCurrency } = storeToRefs(useOptionsStore())
const units = computed(() => searchResultOptions.value.filters.facets.stats.units ?? {})
const priceKeys = computed(() => searchResultOptions.value.priceKeys ?? [])

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

const displayValue = computed(() => {
  const f = props.filter
  if (f.type === 'range' && typeof f.value === 'object') {
    const { gte, lte } = f.value as { gte: number; lte: number }
    if (priceKeys.value.includes(f.key)) {
      return formatPriceSummary(
        [gte, lte],
        searchResultOptions.value.labels.currency,
        searchResultOptions.value.labels.priceSeparator,
        searchResultOptions.value.labels.currencyTemplate,
        multiCurrency.value
      )
    }
    return formatFilterValue(f)
  }
  return String(f.value)
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
