<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useSearchResultStore } from '@/stores/searchResult'
import { RedirectionSuggestionOptions } from '@/types/search-results/RedirectionSuggestionOptionts'
import { extractRedirectionSuggestion } from '@/utils/redirectionSuggest.utils'
import { addParamsToLabel } from '@/utils/string.utils'
import { generateResultLink } from '@/utils/link.utils'
import { useOptionsStore } from '@/stores/options'

const props = defineProps<{
  options?: RedirectionSuggestionOptions[]
}>()

const searchResultStore = useSearchResultStore()
const optionsStore = useOptionsStore()

const { searchResult } = storeToRefs(searchResultStore)

const searchText = computed(() => searchResult.value.searchText)

const redirectionSuggestion = computed(() => {
  return extractRedirectionSuggestion(searchText.value, props.options)
})

const label = computed(() => addParamsToLabel(redirectionSuggestion.value.label, searchText.value))

const link = computed(() =>
  generateResultLink(
    redirectionSuggestion.value.link,
    optionsStore.getQueryParamName,
    searchText.value
  )
)
</script>
<template>
  <div v-if="redirectionSuggestion && label && link" class="lupa-redirection-suggestion">
    <h4 class="lupa-redirections-suggestion-label">
      <a :href="link">{{ label }}</a>
    </h4>
  </div>
</template>
