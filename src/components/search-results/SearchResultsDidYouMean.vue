<script lang="ts" setup>
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import type { InputSuggestionFacet } from '@/types/search-box/Common'
import type { SearchResultsDidYouMeanLabels } from '@/types/search-results/SearchResultsOptions'
import { addParamsToLabel } from '@/utils/string.utils'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  labels: SearchResultsDidYouMeanLabels
}>()

const searchResultStore = useSearchResultStore()
const paramStore = useParamsStore()

const { searchResult } = storeToRefs(searchResultStore)

const didYouMeanValue = computed((): string => {
  return searchResult.value.didYouMean?.options[0].text || ''
})

const insertValue = (text: string): string => {
  if (text.includes('{1}')) {
    return addParamsToLabel(text, searchResult.value.searchText)
  }
  return text
}

const getStyle = (text: string): string => {
  if (text.includes('{1}')) {
    return 'lupa-highlighted-search-text'
  }
  return ''
}

const goToResults = ({
  searchText,
  facet
}: {
  searchText: string
  facet?: InputSuggestionFacet
}) => {
  paramStore.goToResults({ searchText, facet })
}
</script>

<template>
  <div
    v-if="searchResult.suggestedSearchText || didYouMeanValue"
    id="lupa-search-results-did-you-mean"
  >
    <div v-if="searchResult.suggestedSearchText" data-cy="suggested-search-text-label">
      <span v-for="(label, index) in labels.noResultsSuggestion.split(' ')" :key="index">
        <span :class="getStyle(label)">{{ insertValue(label) }} </span>
      </span>
    </div>
    <div v-if="didYouMeanValue" data-cy="did-you-mean-label">
      <span v-for="(label, index) in labels.didYouMean.split(' ')" :key="index">
        <span
          v-if="label.includes('{1}')"
          class="lupa-did-you-mean lupa-highlighted-search-text"
          data-cy="did-you-mean-value"
          @click="goToResults({ searchText: didYouMeanValue })"
          >{{ didYouMeanValue }}</span
        >
        <span v-else>{{ label }} </span>
      </span>
    </div>
  </div>
</template>
