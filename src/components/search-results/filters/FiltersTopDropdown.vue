<script lang="ts" setup>
import type { SearchResultsFilterOptions } from '@/types/search-results/SearchResultsOptions'
import Facets from './facets/Facets.vue'
import { computed } from 'vue'

const props = defineProps<{ options: SearchResultsFilterOptions }>()

const emit = defineEmits(['filter'])

const filter = () => {
  emit('filter')
}

const visible = computed((): boolean => {
  return props.options.visible ?? true
})
</script>

<template>
  <div
    v-if="visible"
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
