<script lang="ts" setup>
import type { FacetAction } from '@/types/search-results/FacetAction'
import type { FacetStyle, ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import type { FacetResult, FilterGroup } from '@getlupa/client-sdk/Types'
import { computed } from 'vue'
import FacetDisplay from './FacetDisplay.vue'
import DesktopFacetToggle from './DesktopFacetToggle.vue'
import { useSidebarToggle } from '@/composables/useSidebarToggle'
import DesktopSortToggle from '../../products/sort/DesktopSortToggle.vue'

const props = defineProps<{
  options: ResultFacetOptions
  facets: FacetResult[]
  currentFilters?: FilterGroup
  facetStyle?: FacetStyle
  clearable?: boolean
}>()

const { handleFilterSidebarToggle } = useSidebarToggle()

const emit = defineEmits(['select', 'clear'])

const currentFiltersValue = computed(() => props.currentFilters ?? {})
const facetsValue = computed(() => props.facets ?? [])

const displayFacets = computed((): FacetResult[] => {
  return props.options.exclude
    ? facetsValue.value.filter((f) => !props.options.exclude?.includes(f.key))
    : facetsValue.value
})

const displayFacetStyle = computed(() => {
  if (!props.facetStyle || props.facetStyle === 'sidebar') {
    return 'sidebar'
  }
  return 'top-dropdown'
})

const handleFacetSelect = (facetAction: FacetAction): void => {
  emit('select', facetAction)
}

const clear = (facet: FacetResult): void => {
  emit('clear', facet)
}
</script>

<template>
  <div class="lupa-search-result-facet-section">
    <div class="lupa-facets-title" v-if="options.labels.title">
      {{ options.labels.title }}
    </div>
    <div class="lupa-search-result-facet-list" :class="'lupa-' + (displayFacetStyle ?? '')">
      <FacetDisplay
        v-for="facet of displayFacets"
        :key="facet.key"
        :facet="facet"
        :currentFilters="currentFiltersValue"
        :options="options"
        :clearable="clearable ?? false"
        :current-facet-style="facetStyle"
        @select="handleFacetSelect"
        @clear="clear"
        @expand="handleFilterSidebarToggle"
      />
      <DesktopFacetToggle v-if="facetStyle === 'drawer'" />
      <DesktopSortToggle v-if="facetStyle === 'drawer' || facetStyle === 'top-dropdown'" />
    </div>
  </div>
</template>
