<script lang="ts" setup>
import { useSearchBoxStore } from '@/stores/searchBox'
import SearchBoxMoreResults from './SearchBoxMoreResults.vue'
import SearchBoxHistoryPanel from './history/SearchBoxHistoryPanel.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { SearchBoxPanelOptions } from '@/types/search-box/SearchBoxOptions'
import { storeToRefs } from 'pinia'
import { type SearchBoxPanel, SearchBoxPanelType } from '@/types/search-box/SearchBoxPanel'

const props = defineProps<{
  options: SearchBoxPanelOptions
  inputValue: string
  isSearchContainer?: boolean
  focused?: boolean
  history?: string[]
}>()

const panelContainer = ref(null)

const history = computed(() => props.history ?? [])

const labels = computed(() => props.options.labels)
const panels = computed(() => props.options.panels)
const sdkOptions = computed(() => props.options.options)

const searchBoxStore = useSearchBoxStore()
const { suggestionResults } = storeToRefs(searchBoxStore)

const emit = defineEmits([
  'go-to-results',
  'clear-history-item',
  'clear-history',
  'fetched',
  'itemSelect'
])

const displayResults = computed(
  () => props.inputValue?.length > 0 && props.inputValue?.length >= props.options.minInputLength
)

const displayHistory = computed(
  () => Boolean(props.options.history) && props.inputValue?.length < 1
)

const displayPanels = computed(() =>
  props.isSearchContainer
    ? panels.value.filter((p) => p.type === SearchBoxPanelType.SUGGESTION)
    : panels.value
)

const getInput = (panel: SearchBoxPanel): string => {
  if (panel.type === SearchBoxPanelType.SUGGESTION || !panel.searchBySuggestion) {
    return props.inputValue
  }
  const queryKey = panels.value.find((x) => x.type === SearchBoxPanelType.SUGGESTION)?.queryKey
  const displaySuggestion =
    queryKey && suggestionResults.value[queryKey]?.length
      ? suggestionResults.value[queryKey][0]
      : ''
  return displaySuggestion ? displaySuggestion.suggestion.suggestion : props.inputValue
}

const highlightChange = ({ action }: { action: 'up' | 'down' | 'clear' }) => {
  searchBoxStore.highlightChange({ action })
}

onMounted(() => {
  window.addEventListener('resize', appHeight)
  window.addEventListener('keydown', handleNavigation)
  setTimeout(() => {
    appHeight()
  })
})

onBeforeUnmount(() => {
  highlightChange({ action: 'clear' })
  window.removeEventListener('resize', appHeight)
  window.removeEventListener('keydown', handleNavigation)
  searchBoxStore.resetHighlightIndex()
})

const handleNavigation = (e: KeyboardEvent): void => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightChange({ action: 'down' })
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightChange({ action: 'up' })
      break
    default:
      break
  }
}

const handleGoToResults = ({ query } = { query: '' }): void => {
  emit('go-to-results', { query })
}

const remove = ({ item }: { item: string }): void => {
  emit('clear-history-item', { item })
}

const removeAll = (): void => {
  emit('clear-history')
}

const getComponent = (type: SearchBoxPanelType): string => {
  switch (type) {
    case 'suggestion':
      return 'SearchBoxSuggestionsWrapper'
    default:
      return 'SearchBoxProductsWrapper'
  }
}

const appHeight = (): void => {
  if (!document || !panelContainer.value) {
    return
  }
  const doc = document.documentElement
  const panel = panelContainer.value as Element
  doc.style.setProperty(
    '--lupa-available-height',
    `${window.innerHeight - panel.getBoundingClientRect().y - 10}px`
  )
}
</script>
<script lang="ts">
import SearchBoxSuggestionsWrapper from './suggestions/SearchBoxSuggestionsWrapper.vue'
import SearchBoxProductsWrapper from './products/SearchBoxProductsWrapper.vue'

export default {
  components: {
    SearchBoxSuggestionsWrapper,
    SearchBoxProductsWrapper
  }
}
</script>
<template>
  <div ref="panelContainer">
    <div v-if="displayResults" id="lupa-search-box-panel">
      <div class="lupa-main-panel" data-cy="lupa-main-panel">
        <div
          v-for="(panel, index) in displayPanels"
          :key="index"
          :class="[
            'lupa-panel-' + panel.type + '-index',
            panel.customClassName ? panel.customClassName : ''
          ]"
          :data-cy="'lupa-panel-' + panel.type + '-index'"
        >
          <component
            v-if="panel.queryKey"
            :is="getComponent(panel.type)"
            :panel="panel"
            :options="sdkOptions"
            :debounce="options.debounce"
            :inputValue="getInput(panel)"
            :labels="labels"
            @fetched="(data: any) => $emit('fetched', data)"
            @itemSelect="(item: any) => $emit('itemSelect', item)"
            @product-click="$emit('product-click')"
          >
            <template v-if="$slots.productCard" #productCard="props">
              <slot name="productCard" v-bind="props" />
            </template>
          </component>
        </div>
      </div>
      <SearchBoxMoreResults
        :labels="labels"
        :showTotalCount="options.showTotalCount ?? false"
        @go-to-results="$emit('go-to-results')"
      ></SearchBoxMoreResults>
    </div>
    <div id="lupa-search-box-panel" v-else-if="displayHistory">
      <SearchBoxHistoryPanel
        :options="options.history"
        :history="history"
        @go-to-results="handleGoToResults"
        @remove="remove"
        @remove-all="removeAll"
      />
    </div>
  </div>
</template>
