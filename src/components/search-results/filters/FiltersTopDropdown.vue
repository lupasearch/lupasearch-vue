<script lang="ts" setup>
import type { SearchResultsFilterOptions } from '@/types/search-results/SearchResultsOptions'
import Facets from './facets/Facets.vue'

defineProps<{ options: SearchResultsFilterOptions }>()

const emit = defineEmits(['filter'])

const filter = () => {
  emit('filter')
}
</script>

<template>
  <div
    id="lupa-search-result-filters"
    class="lupa-search-result-filters lupa-search-result-top-filters"
  >
    <Facets
      v-if="options.facets"
      :options="options.facets"
      :facet-style="options.facets.style?.type"
      :clearable="true"
      @filter="filter"
    />
  </div>
</template>
