<script lang="ts" setup>
import { useSearchResultStore } from '@/stores/searchResult'
import { addParamsToLabel } from '@/utils/string.utils'
import type { SimilarQueryResult } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  similarQuery: SimilarQueryResult
  label: string
}>()

const searchResultStore = useSearchResultStore()
const { searchResult } = storeToRefs(searchResultStore)

const searchText = computed(() => searchResult.value.searchText)

const count = computed((): number => {
  return props.similarQuery.count
})

const insertValue = (text: string, query: string): string[] => {
  return text.includes('{1}') ? addParamsToLabel(text, query).split(' ') : text.split(' ')
}

const getStyle = (text: string): string => {
  return !props.similarQuery.query.includes(text) ? 'lupa-similar-query-crossed' : ''
}
</script>
<template>
  <span id="lupa-similar-query-text-component">
    <span
      v-for="(text, index) in insertValue(label, searchText)"
      :key="index"
      :class="getStyle(text)"
      :data-cy="getStyle(text)"
    >
      {{ text }}
    </span>
    ({{ count }})
  </span>
</template>
