<script lang="ts" setup>
import type { DisplaySuggestion, InputSuggestionFacet } from '@/types/search-box/Common'
import SearchBoxSuggestion from './SearchBoxSuggestion.vue'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import { computed, watch } from 'vue'
import { useSearchBoxStore } from '@/stores/searchBox'
import { storeToRefs } from 'pinia'
import type { Suggestion } from '@getlupa/client-sdk/Types'
import { ref } from 'vue'

const props = defineProps<{
  items: DisplaySuggestion[]
  highlight: boolean
  queryKey: string
  labels: SearchBoxOptionLabels
}>()

const items = computed(() => props.items ?? [])
const highlight = computed(() => props.highlight ?? true)

const suggestionLimit = ref(3);
const limitOptions = [3, 6, 9, 12];

const limitedItems = computed(() => {
  return items.value.slice(0, suggestionLimit.value)
})

const emit = defineEmits<{
  (
    e: 'suggestionSelect',
    value: {
      item: { item: Suggestion; queryKey: string; override: boolean; facet?: InputSuggestionFacet }
      type: 'suggestion'
    }
  ): void
}>()

const searchBoxStore = useSearchBoxStore()

const { highlightedItem } = storeToRefs(searchBoxStore)

const highlightedIndex = computed(() => {
  if (props.queryKey !== highlightedItem.value?.queryKey) {
    return -1
  }
  return highlightedItem.value?.index ?? -1
})

const handleSelect = ({
  suggestion,
  override,
  facet
}: {
  suggestion: Suggestion
  override: boolean
  facet?: InputSuggestionFacet
}): void => {
  emit('suggestionSelect', {
    item: {
      item: suggestion,
      queryKey: props.queryKey,
      override,
      facet
    },
    type: 'suggestion'
  })
}

const getSuggestionKey = (suggestion: DisplaySuggestion): string => {
  return `${suggestion.display}${suggestion.facet?.key}${suggestion.facet?.title}`
}

watch(highlightedItem, () => {
  if (highlightedIndex.value < 0) {
    return
  }
  const selected = props.items[highlightedIndex.value] ?? { suggestion: {}, facet: undefined }
  handleSelect({
    suggestion: selected.suggestion,
    facet: selected.facet,
    override: false
  })
})
</script>

<template>
  <div class="dropdown-container">
    <label for="limit-select">Show up to:</label>
    <select id="limit-select" v-model.number="suggestionLimit">
      <option v-for="option in limitOptions" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </div>
  <div id="lupa-search-box-suggestions" data-cy="lupa-search-box-suggestions">
    <SearchBoxSuggestion
      v-for="(item, index) in limitedItems"
      :key="getSuggestionKey(item)"
      :class="['lupa-suggestion', index === highlightedIndex ? 'lupa-suggestion-highlighted' : '']"
      :suggestion="item"
      :highlight="highlight"
      :labels="labels"
      data-cy="lupa-suggestion"
      @select="handleSelect"
    />
  </div>
</template>
