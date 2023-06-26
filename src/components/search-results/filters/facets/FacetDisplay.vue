<script lang="ts">
import TermFacet from './TermFacet.vue'
import StatsFacet from './StatsFacet.vue'
import HierarchyFacet from './HierarchyFacet.vue'

export default {
  components: {
    TermFacet,
    StatsFacet,
    HierarchyFacet
  }
}
</script>

<script lang="ts" setup>
import { useSearchResultStore } from '@/stores/searchResult'
import type { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import type { FacetGroup, FacetResult, FilterGroup } from '@getlupa/client-sdk/Types'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { FacetAction } from '@/types/search-results/FacetAction'

const props = defineProps<{
  options: ResultFacetOptions
  facet: FacetResult
  currentFilters: FilterGroup
  clearable: boolean
}>()

const facet = computed(() => props.facet ?? [])
const currentFilters = computed(() => props.currentFilters ?? {})

const searchResultStore = useSearchResultStore()
const { currentFilterKeys } = storeToRefs(searchResultStore)

const emit = defineEmits(['select', 'clear'])

const isOpen = ref(props.options.expand?.includes(props.facet.key) ?? false)

const facetPanel = ref(null)

const facetType = computed((): string => {
  switch (facet.value.type) {
    case 'terms':
      return 'term-facet'
    case 'stats':
      return 'stats-facet'
    case 'hierarchy':
      return 'hierarchy-facet'
    default:
      return 'term-facet'
  }
})

const hasItems = computed((): boolean => {
  if (facet.value.type === 'stats') {
    return true
  }
  const currentFacet = facet.value as FacetGroup
  return currentFacet.items?.length > 0
})

const hasFilter = computed((): boolean => {
  return Boolean((currentFilters.value ?? {})[facet.value.key])
})

const filterQueryKey = computed((): string | undefined => {
  return props.options.facetFilterQueries?.[facet.value.key]?.queryKey
})

const activeFilterKeys = computed((): string => {
  return (currentFilterKeys.value ?? []).join(',')
})

onMounted(() => {
  if (props.options.style?.type === 'top-dropdown') {
    window.addEventListener('click', handleMouseClick)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleMouseClick)
})

const handleMouseClick = (e: MouseEvent): void => {
  const el = facetPanel.value as HTMLElement | null
  if (!el) {
    return
  }
  const isOutsideElement = el && !el.contains(e.target as Node)
  if (isOutsideElement) {
    isOpen.value = false
  }
}

watch(activeFilterKeys, () => {
  handleFacetQueryFilter()
})

const toggleFacet = (): void => {
  isOpen.value = !isOpen.value
  handleFacetQueryFilter()
}

const handleFacetQueryFilter = (): void => {
  if (!filterQueryKey.value || !isOpen.value) {
    return
  }
  searchResultStore.queryFacet({
    queryKey: filterQueryKey.value,
    facetKey: facet.value.key
  })
}

const handleFacetSelect = (item: FacetAction): void => {
  emit('select', item)
}

const clear = (): void => {
  emit('clear', facet.value)
  isOpen.value = false
}
</script>
<template>
  <div
    ref="facetPanel"
    class="lupa-search-result-facet-display"
    data-cy="lupa-search-result-facet-display"
    v-if="hasItems"
  >
    <div
      class="lupa-search-result-facet-label"
      data-cy="lupa-search-result-facet-label"
      :class="{ open: isOpen, 'lupa-has-filter': hasFilter }"
      @click="toggleFacet"
    >
      <div class="lupa-facet-label-text">{{ facet.label }}</div>
      <div class="lupa-facet-label-caret" :class="isOpen && 'open'"></div>
    </div>
    <div class="lupa-facet-content" data-cy="lupa-facet-content" v-if="isOpen">
      <component
        :is="facetType"
        :facet="facet"
        :currentFilters="currentFilters[facet.key]"
        :options="options"
        @select="handleFacetSelect"
      />
      <div
        class="lupa-single-facet-clear"
        data-cy="lupa-single-facet-clear"
        v-if="clearable"
        @click="clear"
      >
        {{ options.labels.facetClear }}
      </div>
    </div>
  </div>
</template>
