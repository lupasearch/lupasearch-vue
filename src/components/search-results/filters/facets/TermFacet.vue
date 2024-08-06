<script lang="ts" setup>
import { MAX_FACET_VALUES } from '@/constants/global.const'
import { FACET_TERM_RANGE_SEPARATOR } from '@/constants/queryParams.const'
import type { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import { rangeFilterToString } from '@/utils/filter.utils'
import { getDisplayValue, getNormalizedString } from '@/utils/string.utils'
import type {
  FacetGroup,
  FacetGroupItem,
  FilterGroupItemTypeRange,
  FilterGroupItemTypeTerms
} from '@getlupa/client-sdk/Types'
import { computed, ref } from 'vue'
import { useSearchResultStore } from '@/stores/searchResult'

const props = defineProps<{
  options: ResultFacetOptions
  facet?: FacetGroup
  currentFilters?: FilterGroupItemTypeTerms | FilterGroupItemTypeRange[]
}>()

const searchResultStore = useSearchResultStore()

const facet = computed(() => props.facet ?? { type: 'terms', items: [], key: '' })

const currentFiltersValue = computed(() => props.currentFilters ?? [])

const showAll = ref(false)
const termFilter = ref('')

const emit = defineEmits(['select'])

const itemLimit = computed((): number => {
  return showAll.value || !props.options.facetValueCountLimit
    ? MAX_FACET_VALUES
    : props.options.facetValueCountLimit
})

const allValues = computed((): FacetGroupItem[] => {
  return searchResultStore.filterVisibleFilterValues(facet.value.key, facet.value?.items ?? [])
})

const displayValues = computed((): FacetGroupItem[] => {
  return filteredValues.value
    .slice(0, itemLimit.value)
    .map((v) => ({ ...v, title: getDisplayValue(v.title) }))
})

const filteredValues = computed((): FacetGroupItem[] => {
  return isFilterable.value
    ? allValues.value.filter((v) =>
        getNormalizedString(v.title)?.includes(getNormalizedString(termFilter.value))
      )
    : allValues.value
})

const isFilterable = computed((): boolean => {
  return allValues.value.length >= (props.options.filterable?.minValues ?? MAX_FACET_VALUES)
})

const isRange = computed((): boolean => {
  return facet.value.type === 'range'
})

const displayShowMore = computed((): boolean => {
  return Boolean(
    (showAll.value && props.options.labels.showLess) ||
      itemLimit.value < filteredValues.value.length
  )
})

const handleFacetClick = (item: FacetGroupItem): void => {
  const value = isRange.value
    ? item.title.split(FACET_TERM_RANGE_SEPARATOR)
    : item.title?.toString()
  emit('select', {
    key: facet.value.key,
    value: value,
    type: facet.value.type
  })
}

const toggleShowAll = (): void => {
  showAll.value = !showAll.value
}

const isChecked = (item: FacetGroupItem): boolean => {
  let selectedItems = currentFiltersValue.value ?? []
  selectedItems =
    isRange.value && selectedItems
      ? [rangeFilterToString(selectedItems as FilterGroupItemTypeRange)]
      : selectedItems
  return selectedItems?.includes(item.title?.toString())
}
</script>
<template>
  <div class="lupa-search-result-facet-term-values" data-cy="lupa-search-result-facet-term-values">
    <input
      v-if="isFilterable"
      class="lupa-term-filter"
      data-cy="lupa-term-filter"
      v-model="termFilter"
      :placeholder="options.labels.facetFilter"
    />
    <div class="lupa-terms-list">
      <div
        class="lupa-facet-term"
        data-cy="lupa-facet-term"
        v-for="item of displayValues"
        :key="item.title"
        :class="{ checked: isChecked(item) }"
        @click="handleFacetClick(item)"
      >
        <div class="lupa-term-checkbox-wrapper">
          <span class="lupa-term-checkbox" :class="{ checked: isChecked(item) }"> </span>
        </div>
        <div class="lupa-term-checkbox-label">
          <span class="lupa-term-label">{{ item.title }}</span>
          <span v-if="options.showDocumentCount" class="lupa-term-count">({{ item.count }})</span>
        </div>
      </div>
    </div>
    <div
      v-if="displayShowMore"
      class="lupa-facet-term lupa-show-more-facet-results"
      data-cy="lupa-facet-term"
      @click="toggleShowAll"
    >
      <span v-if="showAll"> {{ options.labels.showLess }}</span>
      <span v-else> {{ options.labels.showAll }}</span>
    </div>
  </div>
</template>
