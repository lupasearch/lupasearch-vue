<script lang="ts" setup>
import type { Document } from '@getlupa/client-sdk/Types'
import { useSearchBoxStore } from '@/stores/searchBox'
import SearchBoxProduct from './SearchBoxProduct.vue'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import type { DocumentSearchBoxPanel } from '@/types/search-box/SearchBoxPanel'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useHistoryStore } from '@/stores/history'
import { useTrackingStore } from '@/stores/tracking'
import { generateLink } from '@/utils/link.utils'
import { useOptionsStore } from '@/stores/options'
import { handleRoutingEvent } from '@/utils/routing.utils'
import { TrackableEventData } from '@/types/search-box/Common'
import { isDelayedClickTracking } from '@/utils/tracking.utils'

const props = defineProps<{
  items: Document[]
  inputValue: string
  panelOptions: DocumentSearchBoxPanel
  labels?: SearchBoxOptionLabels
}>()

const searchBoxStore = useSearchBoxStore()
const historyStore = useHistoryStore()
const trackingStore = useTrackingStore()
const optionsStore = useOptionsStore()

const { boxRoutingBehavior } = storeToRefs(optionsStore)

const emit = defineEmits(['product-click'])

const { highlightedItem } = storeToRefs(searchBoxStore)

const highlightedIndex = computed((): number => {
  if (props.panelOptions.queryKey !== highlightedItem.value?.queryKey) {
    return -1
  }
  return highlightedItem.value?.index ?? -1
})

const showAll = ref(false)

const hasResults = computed(() => {
  return props.items && props.items.length > 0
})

const hasUncollapsedDocumentCountLimit = computed(() => {
  return Boolean(props.panelOptions?.uncollapsedDocumentCount)
})

const showAllItemsToggleButton = computed(() => {
  if (!hasUncollapsedDocumentCountLimit.value) {
    return false
  }
  return props.items?.length > (props.panelOptions?.uncollapsedDocumentCount ?? 0)
})

const displayItems = computed(() => {
  if (showAll.value) {
    return props.items
  }
  const count =
    props.panelOptions.uncollapsedDocumentCount ?? props.panelOptions.limit ?? props.items.length
  return props.items.slice(0, count)
})

const handleProductClick = ({
  item,
  eventType,
  event
}: {
  item: Document
  eventType?: 'itemClick' | 'addToCart'
  event?: Event
}): void => {
  const link = generateLink(props.panelOptions.links?.details ?? '', item)
  const title = props.panelOptions.titleKey
    ? (item[props.panelOptions.titleKey] as string) || ''
    : ''
  const id = props.panelOptions.idKey ? (item[props.panelOptions.idKey] as string) : ''
  if (props.panelOptions.titleKey) {
    historyStore.add({
      item: (item[props.panelOptions.titleKey] as string) || ''
    })
  }
  if (!props.panelOptions.idKey) {
    return
  }
  const trackableEvent = {
    queryKey: props.panelOptions.queryKey,
    data: {
      itemId: id,
      searchQuery: props.inputValue,
      type: eventType || 'itemClick',
      analytics: {
        type: 'autocomplete_product_click',
        label: title ?? link,
        items: [item]
      }
    } as TrackableEventData
  }
  if (isDelayedClickTracking()) {
    trackingStore.trackDelayedEvent({
      ...trackableEvent,
      url: link
    })
  } else {
    trackingStore.trackEvent(trackableEvent)
  }
  if (!link || eventType === 'addToCart') {
    return
  }
  emit('product-click')
  handleRoutingEvent(link, event, boxRoutingBehavior.value === 'event')
  if (props.panelOptions.programmaticNavigation) {
    window.location.assign(link)
  }
}
</script>

<template>
  <div id="lupa-search-box-products" :class="{ 'lupa-search-box-products-expanded': showAll }">
    <template v-if="$slots.productCard">
      <slot
        v-for="(item, index) in displayItems"
        name="productCard"
        :key="index"
        :item="item"
        :panelOptions="panelOptions"
        :labels="labels"
        :highlighted="index === highlightedIndex"
        :inputValue="inputValue"
        :item-clicked="handleProductClick"
      />
    </template>
    <template v-else>
      <SearchBoxProduct
        v-for="(item, index) in displayItems"
        :key="index"
        :item="item"
        :panelOptions="panelOptions"
        :labels="labels"
        :highlighted="index === highlightedIndex"
        :inputValue="inputValue"
        @product-click="handleProductClick"
      />
    </template>
    <div
      v-if="hasResults && panelOptions?.appendCustomHtml && (showAll || !showAllItemsToggleButton)"
      v-html="panelOptions.appendCustomHtml"
    ></div>
    <a v-if="showAllItemsToggleButton" class="lupa-search-box-expand" @click="showAll = !showAll">{{
      showAll ? labels?.showLess : labels?.showMore
    }}</a>
    <slot />
  </div>
</template>
