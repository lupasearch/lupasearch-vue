<script lang="ts" setup>
import type { LabeledFilter } from '@/types/search-results/Filters'
import { computed } from 'vue'

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
</script>

<template>
  <div class="lupa-search-result-filter-value" :class="{ [facetKeyClass]: true }">
    <div class="lupa-current-filter-action" @click="handleClick">⨉</div>
    <div class="lupa-current-filter-label" data-cy="lupa-current-filter-label">
      {{ filter.label }}:
    </div>
    <div class="lupa-current-filter-value" data-cy="lupa-current-filter-value">
      {{ filter.value }}
    </div>
  </div>
</template>
