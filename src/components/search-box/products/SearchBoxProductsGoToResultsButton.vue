<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchBoxStore } from '@/stores/searchBox'
import type { DocumentSearchBoxPanel } from '@/types/search-box/SearchBoxPanel'
import type { SearchBoxPanelOptions } from '@/types/search-box/SearchBoxOptions'

const props = defineProps<{
  options: SearchBoxPanelOptions
  panel: DocumentSearchBoxPanel
}>()

const searchBoxStore = useSearchBoxStore()
const { docResults } = storeToRefs(searchBoxStore)

const emit = defineEmits(['goToResults'])

const goToResultsLabel = computed(
  () => props.panel.labels?.goToResultsTitle ?? props.options.labels?.moreResults
)

const totalCount = computed((): string => {
  if (!props.options.showTotalCount) {
    return ''
  }
  const queryKey = props.panel.queryKey
  const total = queryKey ? docResults.value[queryKey]?.total : ''
  return total ? `(${total})` : ''
})

const goToResults = () => {
  emit('goToResults')
}
</script>
<template>
  <div class="lupa-search-box-documents-go-to-results-wrapper">
    <button class="lupa-search-box-documents-go-to-results-button" @click="goToResults">
      {{ goToResultsLabel }} <span v-if="totalCount">&nbsp;{{ totalCount }}</span>
    </button>
  </div>
</template>
