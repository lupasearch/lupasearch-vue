<script lang="ts" setup>
import { useSearchBoxStore } from '@/stores/searchBox'
import SearchBoxMoreResults from './SearchBoxMoreResults.vue'
import SearchBoxHistoryPanel from './history/SearchBoxHistoryPanel.vue'
import SearchBoxNoResults from './SearchBoxNoResults.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { SearchBoxPanelOptions } from '@/types/search-box/SearchBoxOptions'
import { storeToRefs } from 'pinia'
import {
  type SearchBoxPanel,
  SearchBoxPanelType,
  SearchBoxPanelBase
} from '@/types/search-box/SearchBoxPanel'
import { generateGridTemplate } from '@/utils/grid.utils'

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
const { suggestionResults, hasAnyResults, panelItemCounts } = storeToRefs(searchBoxStore)

const emit = defineEmits([
  'go-to-results',
  'clear-history-item',
  'clear-history',
  'fetched',
  'itemSelect'
])

const displayResults = computed(() => props.inputValue?.length >= props.options.minInputLength)

const displayHistory = computed(
  () =>
    Boolean(props.options.history) &&
    props.inputValue?.length < 1 &&
    props.options.minInputLength > 0
)

const displayPanels = computed(() =>
  props.isSearchContainer
    ? panels.value.filter((p) => p.type === SearchBoxPanelType.SUGGESTION)
    : panels.value
)

const gridTemplate = computed(() => generateGridTemplate(panels.value))

const styleOverrides = computed(() => {
  return {
    display: expandOnSinglePanel.value ? 'block' : 'grid',
    gridTemplateAreas: gridTemplate.value ? gridTemplate.value : 'left right'
  }
})

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
  if (!props.focused) {
    return
  }
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
    case 'related-source':
      return 'SearchBoxRelatedSourceWrapper'
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

const numberOfVisiblePanels = computed(() => {
  return panelItemCounts.value.filter((v) => v.count > 0).length
})

const expandOnSinglePanel = computed(() => {
  return numberOfVisiblePanels.value === 1 && props.options.expandOnSinglePanel
})

const showTopResultsPanelTitle = (queryKey: string) => {
  const panel = panelItemCounts.value.find((v) => v.queryKey === queryKey)
  return panel?.count > 0 && panel?.input.length < 1
}

const showPanelTitle = (panel: SearchBoxPanel) => {
  if (panel.type === SearchBoxPanelType.RELATED_SOURCE) {
    const panelCounts = panelItemCounts.value.find((v) => v.queryKey === panel.sourceIds?.queryKey)
    return panelCounts?.count > 0 && canShowPanel(panel)
  }
  const panelCounts = panelItemCounts.value.find((v) => v.queryKey === panel.queryKey)
  return panelCounts?.count > 0
}

const canShowPanel = (panel: SearchBoxPanelBase) => {
  if (!panel.visibility?.showWhenKeyHasNoResults) {
    return true
  }
  const resultCountFromRelatedPanel =
    panelItemCounts.value.find((v) => v.queryKey === panel.visibility?.showWhenKeyHasNoResults)
      ?.count ?? 0
  return resultCountFromRelatedPanel < 1
}
</script>
<script lang="ts">
import SearchBoxSuggestionsWrapper from './suggestions/SearchBoxSuggestionsWrapper.vue'
import SearchBoxProductsWrapper from './products/SearchBoxProductsWrapper.vue'
import SearchBoxRelatedSourceWrapper from './related-source/SearchBoxRelatedSourceWrapper.vue'

export default {
  components: {
    SearchBoxSuggestionsWrapper,
    SearchBoxProductsWrapper,
    SearchBoxRelatedSourceWrapper
  }
}
</script>
<template>
  <div ref="panelContainer">
    <div v-if="displayResults" id="lupa-search-box-panel">
      <a v-if="labels.closePanel" class="lupa-search-box-close-panel" @click="$emit('close')">
        {{ labels.closePanel }}
      </a>
      <div class="lupa-main-panel" :style="styleOverrides" data-cy="lupa-main-panel">
        <div
          v-for="(panel, index) in displayPanels"
          :key="index"
          :class="[
            'lupa-panel-' + panel.type + '-index',
            panel.customClassName ? panel.customClassName : ''
          ]"
          :style="panel.gridArea ? { gridArea: `${panel.gridArea}${index}` } : {}"
          :data-cy="'lupa-panel-' + panel.type + '-index'"
        >
          <div
            v-if="panel.labels?.topResultsTitle && showTopResultsPanelTitle(panel.queryKey)"
            class="lupa-panel-title lupa-panel-title-top-results"
          >
            {{ panel.labels?.topResultsTitle }}
          </div>
          <div v-if="panel.labels?.title && showPanelTitle(panel)" class="lupa-panel-title">
            {{ panel.labels?.title }}
          </div>
          <component
            v-if="panel.queryKey && canShowPanel(panel)"
            :is="getComponent(panel.type)"
            :panel="panel"
            :search-box-options="options"
            :options="sdkOptions"
            :debounce="options.debounce"
            :inputValue="getInput(panel)"
            :labels="labels"
            @fetched="(data: any) => $emit('fetched', data)"
            @itemSelect="(item: any) => $emit('itemSelect', item)"
            @product-click="$emit('product-click')"
            @go-to-results="handleGoToResults"
          >
            <template v-if="$slots.productCard" #productCard="props">
              <slot name="productCard" v-bind="props" />
            </template>
          </component>
        </div>
      </div>
      <SearchBoxNoResults v-if="!hasAnyResults && options.showNoResultsPanel" :labels="labels" />
      <SearchBoxMoreResults
        v-if="hasAnyResults || !options.hideMoreResultsButtonOnNoResults"
        :labels="labels"
        :options="options"
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
