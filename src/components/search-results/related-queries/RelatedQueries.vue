<script lang="ts" setup>
import { useSearchResultStore } from '@/stores/searchResult'
import { RelatedQueryOptions } from '@/types/search-results/RelatedQueryOptions'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { extractRelatedSource } from '@/utils/relatedSource.utils'
import RelatedQueryPanel from './RelatedQueryPanel.vue'
import { useParamsStore } from '@/stores/params'

const props = defineProps<{
  options?: RelatedQueryOptions
}>()

const searchResultStore = useSearchResultStore()
const paramsStore = useParamsStore()
const { searchResult } = storeToRefs(searchResultStore)

const relatedQueries = computed(() => {
  if (!props.options || !searchResult.value) {
    return []
  }
  return extractRelatedSource(props.options.source, searchResult.value)
})

const hasEnoughRelatedQueries = computed(() => {
  return relatedQueries.value.length > 1
})

const goToResults = ({ searchText }: { searchText: string }) => {
  paramsStore.goToResults({ searchText })
}
</script>
<template>
  <div v-if="options && hasEnoughRelatedQueries" class="lupa-related-queries">
    <h3 v-if="options?.labels?.title" class="lupa-related-queries-title">
      {{ options?.labels?.title }}
    </h3>
    <ul>
      <li v-for="query of relatedQueries" :key="query">
        <a @click="goToResults({ searchText: query })">
          <RelatedQueryPanel :options="options" :query="query" />
        </a>
      </li>
    </ul>
  </div>
</template>
