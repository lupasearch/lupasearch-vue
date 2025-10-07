<script lang="ts" setup>
import type { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import HierarchyFacetLevel from './HierarchyFacetLevel.vue'
import type {
  FacetGroupHierarchy,
  FilterGroupItemTypeHierarchy,
  HierarchyTree
} from '@getlupa/client-sdk/Types'
import { computed, ref } from 'vue'
import { MAX_FACET_VALUES } from '@/constants/global.const'
import { recursiveFilter } from '@/utils/filter.utils'

const props = defineProps<{
  options: ResultFacetOptions
  facet: FacetGroupHierarchy
  currentFilters: FilterGroupItemTypeHierarchy
}>()

const currentFilters = computed(() => props.currentFilters ?? { terms: [] })
const facet = computed(() => props.facet ?? { items: [], key: '' })

const showAll = ref(false)
const termFilter = ref('')
const level = ref(0)

const emit = defineEmits(['select'])

const itemLimit = computed((): number => {
  return showAll.value || !props.options.hierarchy?.topLevelValueCountLimit
    ? MAX_FACET_VALUES
    : props.options.hierarchy?.topLevelValueCountLimit
})

const allValues = computed((): HierarchyTree[] => {
  return facet.value?.items ?? []
})

const displayValues = computed((): HierarchyTree[] => {
  return filteredValues.value.slice(0, itemLimit.value)
})

const filteredValues = computed((): HierarchyTree[] => {
  return isFilterable.value ? recursiveFilter(allValues.value, termFilter.value) : allValues.value
})

const isFilterable = computed((): boolean => {
  return (
    Boolean(props.options.hierarchy?.filterable) &&
    allValues.value.length >= (props.options.filterable?.minValues ?? MAX_FACET_VALUES)
  )
})

const handleFacetClick = ({ value }: { value: string }): void => {
  emit('select', {
    key: facet.value.key,
    value,
    type: 'hierarchy',
    behavior: props.options.hierarchy?.behavior ?? 'append'
  })
}

const handleShowAll = (): void => {
  showAll.value = true
}

const handleCancelShowAll = () => {
  showAll.value = false
}
</script>

<template>
  <div
    class="lupa-search-result-facet-term-values lupa-search-result-facet-hierarchy-values"
    data-cy="lupa-search-result-facet-term-values"
  >
    <div v-if="isFilterable">
      <input
        class="lupa-term-filter"
        data-cy="lupa-term-filter"
        v-model="termFilter"
        :placeholder="options.labels.facetFilter"
      />
    </div>
    <HierarchyFacetLevel
      v-for="item of displayValues"
      :key="item.title"
      :options="options"
      :item="item"
      :termFilter="termFilter"
      :currentFilters="currentFilters as unknown as FilterGroupItemTypeHierarchy"
      :level="level"
      @select="handleFacetClick"
    />
    <div
      v-if="itemLimit < filteredValues.length"
      class="lupa-facet-term lupa-show-more-facet-results"
      data-cy="lupa-facet-term"
      @click="handleShowAll"
    >
      {{ options.labels.showAll }}
    </div>
    <div
      v-else-if="showAll"
      class="lupa-facet-term lupa-show-more-facet-results lupa-show-less-facet-results"
      @click="handleCancelShowAll"
    >
      {{ options.labels.showLess }}
    </div>
  </div>
</template>
