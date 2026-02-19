<script lang="ts" setup>
import type { SearchResultsFilterOptions } from '@/types/search-results/SearchResultsOptions'
import Facets from './facets/Facets.vue'
import { computed } from 'vue'
import { useLoadingSkeleton } from '@/composables/useLoadingSkeleton'
import LoadingBlock from '@/components/common/skeleton/LoadingBlock.vue'

const props = defineProps<{ options: SearchResultsFilterOptions }>()
const { facetSkeletonEnabled, loadingFacets } = useLoadingSkeleton()

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
    <LoadingBlock
      class="lupa-skeleton-top-dropdown-filters"
      :count="1"
      :enabled="facetSkeletonEnabled"
      :loading="loadingFacets"
    >
      <Facets
        v-if="options.facets"
        :options="options.facets"
        :facet-style="options.facets.style?.type"
        :clearable="true"
        @filter="filter"
      />
    </LoadingBlock>
  </div>
</template>
