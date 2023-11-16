<script lang="ts" setup>
import type { Document } from '@getlupa/client-sdk/Types'
import { useSearchBoxStore } from '@/stores/searchBox'
import SearchBoxProduct from './SearchBoxProduct.vue'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import type { DocumentSearchBoxPanel } from '@/types/search-box/SearchBoxPanel'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useHistoryStore } from '@/stores/history'
import { useTrackingStore } from '@/stores/tracking'
import { generateLink } from '@/utils/link.utils'
import { useOptionsStore } from '@/stores/options'
import { handleRoutingEvent } from '@/utils/routing.utils'

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
  trackingStore.trackEvent({
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
    }
  })
  if (!link) {
    return
  }
  emit('product-click')
  handleRoutingEvent(link, event, boxRoutingBehavior.value === 'event')
}
</script>

<template>
  <div id="lupa-search-box-products">
    <template v-if="$slots.productCard">
      <slot
        name="productCard"
        v-for="(item, index) in items"
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
        v-for="(item, index) in items"
        :key="index"
        :item="item"
        :panelOptions="panelOptions"
        :labels="labels"
        :highlighted="index === highlightedIndex"
        :inputValue="inputValue"
        @product-click="handleProductClick"
      />
    </template>
  </div>
</template>
