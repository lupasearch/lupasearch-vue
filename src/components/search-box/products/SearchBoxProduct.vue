<script lang="ts" setup>
import { useHistoryStore } from '@/stores/history'
import SearchBoxProductElement from './elements/SearchBoxProductElement.vue'
import { useTrackingStore } from '@/stores/tracking'
import { useOptionsStore } from '@/stores/options'
import type { Document } from '@getlupa/client-sdk/Types'
import type { DocumentSearchBoxPanel } from '@/types/search-box/SearchBoxPanel'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { generateLink } from '@/utils/link.utils'
import { DocumentElementType, type DocumentElement } from '@/types/DocumentElement'
import { handleRoutingEvent } from '@/utils/routing.utils'

const historyStore = useHistoryStore()
const trackingStore = useTrackingStore()
const optionsStore = useOptionsStore()

const isInStock = ref(true)

const props = defineProps<{
  item: Document
  inputValue: string
  panelOptions: DocumentSearchBoxPanel
  labels?: SearchBoxOptionLabels
  highlighted?: boolean
}>()

const { boxRoutingBehavior } = storeToRefs(optionsStore)

const emit = defineEmits(['product-click'])

const link = computed((): string => {
  return generateLink(props.panelOptions.links?.details ?? '', props.item)
})

const imageElements = computed((): DocumentElement[] => {
  return props.panelOptions.elements?.filter((e) => e.type === DocumentElementType.IMAGE) ?? []
})

const detailElements = computed((): DocumentElement[] => {
  return (
    props.panelOptions.elements?.filter(
      (e) => e.type !== DocumentElementType.IMAGE && e.type !== DocumentElementType.ADDTOCART
    ) ?? []
  )
})

const id = computed((): string => {
  if (props.panelOptions.idKey) {
    return props.item[props.panelOptions.idKey] as string
  }
  return ''
})

const title = computed((): string => {
  if (!props.panelOptions.titleKey) {
    return ''
  }
  const title = (props.item[props.panelOptions.titleKey] as string) || ''
  historyStore.add({
    item: title
  })
  return title
})

const addToCartElement = computed(() => {
  return props.panelOptions.elements?.find((e) => e.type === DocumentElementType.ADDTOCART)
})

const handleClick = (event?: Event): void => {
  if (props.panelOptions.titleKey) {
    historyStore.add({
      item: (props.item[props.panelOptions.titleKey] as string) || ''
    })
  }
  if (!props.panelOptions.idKey) {
    return
  }
  trackingStore.trackEvent({
    queryKey: props.panelOptions.queryKey,
    data: {
      itemId: id.value,
      searchQuery: props.inputValue,
      type: 'itemClick',
      analytics: {
        type: 'autocomplete_product_click',
        label: title.value ?? link.value,
        items: [props.item]
      }
    }
  })
  if (!link.value) {
    return
  }
  emit('product-click')
  handleRoutingEvent(link.value, event, boxRoutingBehavior.value === 'event')
}

onMounted((): void => {
  checkIfIsInStock()
})

const checkIfIsInStock = async (): Promise<void> => {
  isInStock.value = props.panelOptions.isInStock
    ? await props.panelOptions.isInStock(props.item)
    : true
}
</script>

<template>
  <a
    class="lupa-search-box-product"
    :class="{ 'lupa-search-box-product-highlighted': highlighted }"
    data-cy="lupa-search-box-product"
    :href="link"
    @click="handleClick"
  >
    <div class="lupa-search-box-product-image-section">
      <SearchBoxProductElement
        class="lupa-search-box-product-element"
        v-for="element in imageElements"
        :item="item"
        :element="element"
        :key="element.key"
        :labels="labels"
        :link="link"
      />
    </div>

    <div class="lupa-search-box-product-details-section">
      <SearchBoxProductElement
        class="lupa-search-box-product-element"
        v-for="element in detailElements"
        :item="item"
        :element="element"
        :key="element.key"
        :labels="labels"
        :link="link"
      />
    </div>

    <div v-if="addToCartElement" class="lupa-search-box-product-add-to-cart-section">
      <SearchBoxProductElement
        class="lupa-search-box-product-element"
        :item="item"
        :element="addToCartElement"
        :labels="labels"
        :link="link"
        :isInStock="isInStock"
      />
    </div>
  </a>
</template>
