<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import SearchBoxSuggestions from './SearchBoxSuggestions.vue'
import type { SuggestionSearchBoxPanel } from '@/types/search-box/SearchBoxPanel'
import type { SdkOptions } from '@/types/General'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import { useSearchBoxStore } from '@/stores/searchBox'
import { storeToRefs } from 'pinia'
import { debounce } from '@/utils/debounce.utils'

const props = defineProps<{
  panel: SuggestionSearchBoxPanel
  options: SdkOptions
  inputValue: string
  debounce?: number
  labels: SearchBoxOptionLabels
}>()

const inputValueProp = computed(() => props.inputValue)

const searchBoxStore = useSearchBoxStore()
const { suggestionResults } = storeToRefs(searchBoxStore)

const emit = defineEmits(['fetched', 'itemSelect'])

const searchResult = computed(() => suggestionResults.value[props.panel.queryKey] ?? [])

onMounted(() => {
  getSuggestionsDebounced()
})

watch(inputValueProp, () => {
  getSuggestionsDebounced()
})

const getSuggestions = (): void => {
  searchBoxStore
    .querySuggestions({
      queryKey: props.panel.queryKey,
      publicQuery: { searchText: props.inputValue, limit: props.panel.limit },
      options: props.options
    })
    .then(({ suggestions }) => {
      if (!suggestions) {
        return
      }
      emit('fetched', { items: suggestions, type: props.panel.type })
    })
    .catch((err) => {
      console.error(err)
    })
}

const getSuggestionsDebounced = debounce(getSuggestions, props.debounce)
</script>
<template>
  <SearchBoxSuggestions
    :items="searchResult"
    :highlight="panel.highlight"
    :queryKey="panel.queryKey"
    :labels="labels"
    @suggestionSelect="(item) => $emit('itemSelect', item)"
  />
</template>
