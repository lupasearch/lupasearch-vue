<script lang="ts" setup>
import { useSearchResultStore } from '@/stores/searchResult'
import { addParamsToLabel } from '@/utils/string.utils'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  label: string
  clearable?: boolean
}>()

const searchResultStore = useSearchResultStore()
const { totalItems, itemRange } = storeToRefs(searchResultStore)

const summaryLabel = computed((): string => {
  const range = itemRange.value.join('-')
  return addParamsToLabel(props.label, range, `<span>${totalItems.value}</span>`)
})
</script>
<template>
  <div class="lupa-search-results-summary" v-if="totalItems > 0">
    <div v-html="summaryLabel"></div>
    <span
      v-if="clearable"
      class="lupa-filter-clear"
      data-cy="lupa-facets-summary-clear"
      @click="$emit('clear')"
      >✕</span
    >
  </div>
</template>
