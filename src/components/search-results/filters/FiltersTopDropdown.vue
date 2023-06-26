<script lang="ts" setup>
import type { SearchResultsFilterOptions } from '@/types/search-results/SearchResultsOptions'
import Facets from './facets/Facets.vue'

defineProps<{ options: SearchResultsFilterOptions }>()
</script>

<template>
  <div id="lupa-search-result-filters" class="lupa-search-result-filters">
    <Facets
      v-if="options.facets"
      :options="options.facets"
      :facet-style="options.facets.style?.type"
      :clearable="true"
    />
  </div>
</template>
