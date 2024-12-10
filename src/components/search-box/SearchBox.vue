<script lang="ts" setup>
import { useHistoryStore } from '@/stores/history'
import SearchBoxInput from './SearchBoxInput.vue'
import SearchBoxMainPanel from './SearchBoxMainPanel.vue'
import { useParamsStore } from '@/stores/params'
import { useOptionsStore } from '@/stores/options'
import { useSearchBoxStore } from '@/stores/searchBox'
import { useTrackingStore } from '@/stores/tracking'
import type {
  SearchBoxInputOptions,
  SearchBoxOptionLabels,
  SearchBoxOptions,
  SearchBoxPanelOptions
} from '@/types/search-box/SearchBoxOptions'
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type {
  FetchedData,
  HighlightedDocInfo,
  InputSuggestion,
  SelectedData,
  TrackableEventData
} from '@/types/search-box/Common'
import { storeToRefs } from 'pinia'
import { pick } from '@/utils/picker.utils'
import { DocumentSearchBoxPanel, SearchBoxPanelType } from '@/types/search-box/SearchBoxPanel'
import type { Document, Suggestion } from '@getlupa/client-sdk/Types'
import { debounce } from '@/utils/debounce.utils'
import { bindSearchTriggers, unbindSearchTriggers } from '@/utils/event.utils'
import { useRedirectionStore } from '@/stores/redirections'
import { isDelayedClickTracking } from '@/utils/tracking.utils'
import { generateLink } from '@/utils/link.utils'

const defaultSuggestedValue = {
  item: { suggestion: '' },
  queryKey: '',
  override: false
}

const props = defineProps<{
  options: SearchBoxOptions
  isSearchContainer?: boolean
}>()

const historyStore = useHistoryStore()
const paramsStore = useParamsStore()
const searchBoxStore = useSearchBoxStore()
const optionsStore = useOptionsStore()
const trackingStore = useTrackingStore()
const redirectionStore = useRedirectionStore()

const inputValue = ref('')
const suggestedValue: Ref<InputSuggestion> = ref(defaultSuggestedValue)

const opened = ref(props.isSearchContainer)
const focused = ref(false)

const searchBoxInput = ref(null)

const { highlightedDocument } = storeToRefs(searchBoxStore)

const searchValue = computed((): string => {
  return suggestedValue.value.override ? suggestedValue.value.item.suggestion : inputValue.value
})

const inputOptions = computed(
  (): SearchBoxInputOptions =>
    pick(props.options, [
      'minInputLength',
      'labels',
      'links',
      'inputAttributes',
      'showSubmitButton'
    ])
)

const panelOptions = computed(
  (): SearchBoxPanelOptions =>
    pick(props.options, [
      'minInputLength',
      'panels',
      'history',
      'labels',
      'links',
      'options',
      'debounce',
      'showTotalCount',
      'hideMoreResultsButtonOnNoResults',
      'showNoResultsPanel',
      'expandOnSinglePanel',
      'showMoreResultsButton'
    ])
)

const searchTriggers = computed((): string[] => {
  return props.options.searchTriggers ?? []
})

const goToResultsDebounced = debounce(paramsStore.goToResults, props.options.debounce ?? 300)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('click', handleMouseClick)

  paramsStore.setSearchResultsLink(props.options.links.searchResults)
  searchBoxStore.saveOptions({ newOptions: props.options })
  optionsStore.setSearchBoxOptions({ options: props.options })
  redirectionStore.initiate(props.options.redirections, props.options.options)
  bindSearchTriggers(searchTriggers.value, handleCurrentValueSearch)
  if (props.isSearchContainer && searchBoxInput.value) {
    ;(searchBoxInput.value as HTMLInputElement)?.focus()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('click', handleMouseClick)
  unbindSearchTriggers(searchTriggers.value, handleCurrentValueSearch)
})

const handleMouseClick = (e: MouseEvent): void => {
  const el = document.getElementById('lupa-search-box')
  const elementClass = (e.target as HTMLElement)?.className ?? ''
  const hasLupaClass =
    typeof elementClass.includes == 'function' && elementClass.includes('lupa-search-box')
  const isOutsideElement = el && !el.contains(e.target as Node) && !hasLupaClass

  if (isOutsideElement && props.options.keepOpen) {
    focused.value = false
  }

  if (!isOutsideElement || props.options.keepOpen) {
    return
  }

  opened.value = false
  suggestedValue.value = defaultSuggestedValue
}

const close = () => {
  opened.value = false
  focused.value = false
  suggestedValue.value = defaultSuggestedValue
}

const handleKeyDown = (e: KeyboardEvent): void => {
  if (!focused.value) {
    return
  }
  switch (e.key) {
    case 'Tab':
      if (suggestedValue?.value?.item?.suggestion) {
        e.preventDefault()
        selectSuggestion({ ...suggestedValue.value, override: true })
      }
      break
    case 'Enter':
      e.preventDefault()
      handleSearch()
      resetValues()
      break
    default:
      break
  }
}

const handleInput = (value: string): void => {
  opened.value = true
  focused.value = true
  inputValue.value = value?.replace(/\s+$/, '') ?? ''
  suggestedValue.value = defaultSuggestedValue
  searchBoxStore.resetHighlightIndex()
  trackSearchQuery(value)
  if (props.isSearchContainer) {
    goToResultsDebounced({
      searchText: value
    })
  }
}

const handleItemsFetch = (data: FetchedData): void => {
  switch (data.type) {
    case SearchBoxPanelType.SUGGESTION: {
      const item = data.items[0] as Suggestion | undefined
      let suggestion = item || { suggestion: '' }
      suggestion =
        !suggestion.suggestion.includes(inputValue.value) ||
        suggestion.suggestion.length === inputValue.value?.length
          ? { suggestion: '' }
          : suggestion
      suggestedValue.value = {
        item: suggestion,
        override: false,
        queryKey: ''
      }
      break
    }
    default:
      break
  }
}

const handleItemSelect = (data: SelectedData): void => {
  switch (data.type) {
    case SearchBoxPanelType.SUGGESTION: {
      const suggestion = data.item as InputSuggestion
      selectSuggestion(suggestion, suggestion.override)
      break
    }
    default:
      break
  }
}

const selectSuggestion = (inputSuggestion: InputSuggestion, shouldSearch = false): void => {
  if (inputSuggestion.item.suggestion) {
    suggestedValue.value = {
      ...inputSuggestion,
      override: true
    }
    if (inputSuggestion.override) {
      trackSuggestionClick()
    }
    inputValue.value = inputSuggestion.override ? inputSuggestion.item.suggestion : inputValue.value
  }
  if (shouldSearch) {
    handleSearch()
  }
}

const handleNavigateDocument = ({ link }: { doc?: Document; link?: string }): void => {
  if (!link) {
    return
  }
  window.location.assign(link)
}

const handleCurrentValueSearch = (): void => {
  if (searchValue.value?.length < props.options.minInputLength) {
    return
  }
  opened.value = false
  paramsStore.goToResults({ searchText: searchValue.value })
  resetValues()
}

const handleSearch = ({ query } = { query: '' }): void => {
  const searchText = query || searchValue.value
  if (searchText.length < props.options.minInputLength) {
    return
  }
  if (highlightedDocument.value?.doc) {
    trackDocumentClick(highlightedDocument.value)
    handleNavigateDocument(highlightedDocument.value)
    return
  }
  trackSuggestionClick()
  historyStore.add({ item: searchText })
  opened.value = false

  paramsStore.goToResults({ searchText, facet: suggestedValue.value.facet })
}

const trackDocumentClick = (doc: HighlightedDocInfo): void => {
  if (!doc.queryKey || !doc.doc) {
    return
  }
  const event = {
    queryKey: doc.queryKey,
    data: {
      itemId: doc.id as string,
      searchQuery: inputValue.value,
      type: 'itemClick',
      analytics: {
        type: 'autocomplete_product_click',
        label: doc.title || (doc.id as string),
        items: [doc]
      }
    } as TrackableEventData
  }
  if (isDelayedClickTracking()) {
    trackingStore.trackDelayedEvent({
      ...event,
      url: generateLink(props.options.links.searchResults, doc)
    })
  } else {
    trackingStore.trackEvent(event)
  }
}

const trackSearchQuery = (query?: string): void => {
  if (!query) {
    return
  }
  trackingStore.trackSearch({
    queryKey: suggestedValue.value.queryKey,
    query: {
      searchText: query
    }
  })
}

const trackSuggestionClick = (suggestion?: string): void => {
  if (
    suggestion ||
    inputValue.value?.length < props.options.minInputLength ||
    inputValue.value === searchValue.value
  ) {
    return
  }
  trackingStore.trackEvent({
    queryKey: suggestedValue.value.queryKey,
    data: {
      itemId: suggestion || searchValue.value,
      searchQuery: inputValue.value,
      type: 'suggestionClick',
      analytics: {
        type: 'autocomplete_suggestion_click',
        label: suggestion || searchValue.value
      }
    }
  })
}

watch(() => props.options.debounce, handleCurrentValueSearch)

const open = () => {
  opened.value = true
  focused.value = true
}

const resetValues = (): void => {
  inputValue.value = ''
  suggestedValue.value = defaultSuggestedValue
}

const handleProductClick = (): void => {
  opened.value = false
  focused.value = false
}

const slotProps = (
  props: any
): {
  key: string
  item: Document
  labels?: SearchBoxOptionLabels
  highlighted: boolean
  panelOptions: DocumentSearchBoxPanel
  itemClicked: (props: {
    item: Document
    eventType?: 'itemClick' | 'addToCart'
    event?: Event
  }) => void
} => {
  return {
    ...props
  }
}
</script>
<template>
  <div id="lupa-search-box">
    <div class="lupa-search-box-wrapper">
      <SearchBoxInput
        :options="inputOptions"
        :suggestedValue="suggestedValue"
        :can-close="isSearchContainer ?? false"
        :emit-input-on-focus="!isSearchContainer"
        ref="searchBoxInput"
        @input="handleInput"
        @blur="focused = false"
        @focus="opened = true"
        @search="handleSearch"
        @close="$emit('close')"
      />
      <SearchBoxMainPanel
        v-if="opened || isSearchContainer"
        :options="panelOptions"
        :inputValue="inputValue"
        :isSearchContainer="isSearchContainer"
        :focused="focused"
        @fetched="handleItemsFetch"
        @itemSelect="handleItemSelect"
        @go-to-results="handleSearch"
        @product-click="handleProductClick"
        @close="close"
      >
        <template v-if="$slots.productCard" #productCard="props">
          <slot name="productCard" v-bind="slotProps(props)" />
        </template>
      </SearchBoxMainPanel>
    </div>
  </div>
</template>
