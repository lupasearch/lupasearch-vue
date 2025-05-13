<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import type { LabeledFilter } from '@/types/search-results/Filters'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{ filter: LabeledFilter }>()
const emit  = defineEmits<{
  (e: 'remove', payload: { filter: LabeledFilter }): void
}>()

const facetKeyClass = computed(() => `lupa-facet-active-filter-${props.filter.key}`)

const { searchResultOptions } = storeToRefs(useOptionsStore())
const units = computed(() => searchResultOptions.value.filters.facets.stats.units ?? {})

function handleClick() {
  emit('remove', { filter: props.filter })
}

function formatFilterValue(filter: LabeledFilter): string {
  const unit = units.value[filter.key] || ''
  let min: string|undefined, max: string|undefined

  if (Array.isArray(filter.value)) {
    [min, max] = filter.value.map(String)
  } else if (typeof filter.value === 'string' && filter.value.includes('-')) {
    const parts = filter.value.split('-').map(s => s.trim())
    if (parts.length === 2) [min, max] = parts
  }

  if (min != null && max != null) {
    return `${min} ${unit} – ${max} ${unit}`
  }
  return `${filter.value} ${unit}`.trim()
}
</script>

<template>
  <div
    class="lupa-search-result-filter-value"
    :class="[ facetKeyClass ]"
    data-cy="lupa-current-filter-item"
  >
    <!-- remove button -->
    <button
      class="lupa-current-filter-action"
      @click="handleClick"
      aria-label="Remove filter"
    >
      ×
    </button>

    <!-- label + formatted value -->
    <div class="lupa-current-filter-label" data-cy="lupa-current-filter-label">
      {{ props.filter.label }}:
    </div>
    <div class="lupa-current-filter-value" data-cy="lupa-current-filter-value">
      {{ formatFilterValue(props.filter) }}
    </div>
  </div>
</template>
