<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchResultStore } from '@/stores/searchResult'
import { SearchResultsOptionLabels } from '@/types/search-results/SearchResultsOptions'
import Spinner from '@/components/common/Spinner.vue'

const searchResultStore = useSearchResultStore()
const { loadingRefiners } = storeToRefs(searchResultStore)

const props = defineProps<{
  labels: SearchResultsOptionLabels
}>()

const label = computed(() => props.labels.refinersLoadingNotice)
</script>

<template>
  <div v-if="label && loadingRefiners" class="lupa-refiners-loading-notice">
    <p>{{ label }}</p>
    <Spinner />
  </div>
</template>
