<script setup lang="ts">
import { useSearchResultStore } from '@/stores/searchResult'
import { ZeroResultsOptions } from '@/types/search-results/SearchResultsOptions'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  emptyResultsLabel?: string
  currentQueryText?: string
  hasSimilarQueries?: boolean
  zeroResults?: ZeroResultsOptions
}>()

const searchResultStore = useSearchResultStore()

const { searchResult } = storeToRefs(searchResultStore)

const showDefaultZeroResultsTemplate = computed(() => {
  return (
    (props.emptyResultsLabel && props.zeroResults?.customHtml === undefined) ||
    (props.hasSimilarQueries && !props.zeroResults?.showWithSimilarQueries)
  )
})

const showCustomZeroResultsTemplate = computed(() => {
  return (
    props.zeroResults?.customHtml !== undefined &&
    (!props.hasSimilarQueries || props.zeroResults?.showWithSimilarQueries)
  )
})

const htmlTemplate = computed(() => {
  if (props.zeroResults?.customHtml) {
    return props.zeroResults.customHtml(searchResult.value)
  }
  return ''
})
</script>
<template>
  <div v-if="showDefaultZeroResultsTemplate">
    {{ emptyResultsLabel }} <span>{{ currentQueryText }}</span>
  </div>
  <div v-if="showCustomZeroResultsTemplate" v-html="htmlTemplate"></div>
</template>
