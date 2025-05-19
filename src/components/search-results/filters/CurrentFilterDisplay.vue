<script lang="ts" setup>
import type { LabeledFilter } from '@/types/search-results/Filters'
import { computed } from 'vue'
import { useOptionsStore } from '@/stores/options'
import { formatPriceSummary } from '@/utils/price.utils'

const props = defineProps<{
  filter: LabeledFilter
}>()

const facetKeyClass = computed((): string => {
  return `lupa-facet-active-filter-${props.filter.key}`
})

const emit = defineEmits(['remove'])

const handleClick = (): void => {
  emit('remove', { filter: props.filter })
}

const opts = useOptionsStore()
const currency = opts.searchResultOptions.labels.currency
const separator = opts.searchResultOptions.labels.priceSeparator
const currencyTemplate = opts.searchResultOptions.labels.currencyTemplate

const displayValue = computed(() => {
  if (props.filter.type === 'range' && typeof props.filter.value === 'object') {
    const { gte, lte } = props.filter.value as { gte: number; lte: number }
    return formatPriceSummary([gte, lte], currency, separator, currencyTemplate)
  }
  return props.filter.value as string
})
</script>

<template>
  <div class="lupa-search-result-filter-value" :class="{ [facetKeyClass]: true }">
    <div class="lupa-current-filter-action" @click="handleClick">⨉</div>
    <div class="lupa-current-filter-label" data-cy="lupa-current-filter-label">
      {{ filter.label }}:
    </div>
    <div class="lupa-current-filter-value" data-cy="lupa-current-filter-value">
      {{ displayValue }}
    </div>
  </div>
</template>
