<script lang="ts" setup>
import type { Document } from '@getlupa/client-sdk/Types'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import { processDisplayCondition } from '@/utils/render.utils'
import type { DocumentElement } from '@/types/DocumentElement'
import { DocumentElementType } from '@/types/DocumentElement'
import { useDynamicDataStore } from '@/stores/dynamicData'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  item: Document
  element: DocumentElement
  labels?: SearchResultsOptionLabels
  inStock?: boolean
  link: string
}>()

const dynamicDataStore = useDynamicDataStore()
const { dynamicDataIdMap, loadingIds, loading } = storeToRefs(dynamicDataStore)

const emit = defineEmits(['productEvent'])

const elementComponent = computed((): string => {
  switch (props.element.type) {
    case DocumentElementType.IMAGE:
      return 'searchResultsProductImage'
    case DocumentElementType.TITLE:
      return 'searchResultsProductTitle'
    case DocumentElementType.DESCRIPTION:
      return 'searchResultsProductDescription'
    case DocumentElementType.RATING:
      return 'searchResultsProductRating'
    case DocumentElementType.SINGLE_STAR_RATING:
      return 'SearchResultsProductSingleStarRating'
    case DocumentElementType.PRICE:
      return 'searchResultsProductPrice'
    case DocumentElementType.REGULARPRICE:
      return 'searchResultsProductRegularPrice'
    case DocumentElementType.ADDTOCART:
      return 'searchResultsProductAddToCart'
    case DocumentElementType.CUSTOM:
      return 'searchResultsProductCustom'
    case DocumentElementType.CUSTOM_HTML:
      return 'searchResultsProductCustomHtmlElement'
  }
  return 'searchResultsProductTitle'
})

const enhancedItem = computed((): Document => {
  if (!props.item?.id) {
    return props.item
  }
  const enhancementData = dynamicDataIdMap.value?.[props.item?.id as string] ?? {}
  return {
    ...props.item,
    ...enhancementData
  }
})

const displayElement = computed((): boolean => {
  const element = props.element
  const item = enhancedItem.value
  if (!element.display) {
    return true
  }
  return typeof element.display === 'function'
    ? element.display(item)
    : processDisplayCondition(element.display, item)
})

const handleProductEvent = (item: { type: string }): void => {
  emit('productEvent', item)
}

const isLoadingDynamicData = (id?: unknown) => {
  return Boolean(props.element.dynamic && id && loading.value && loadingIds?.value[id as string])
}
</script>
<script lang="ts">
import SearchResultsProductImage from './SearchResultsProductImage.vue'
import SearchResultsProductTitle from './SearchResultsProductTitle.vue'
import SearchResultsProductDescription from './SearchResultsProductDescription.vue'
import SearchResultsProductRating from './SearchResultsProductRating.vue'
import SearchResultsProductRegularPrice from './SearchResultsProductRegularPrice.vue'
import SearchResultsProductPrice from './SearchResultsProductPrice.vue'
import SearchResultsProductAddToCart from './SearchResultsProductAddToCart.vue'
import SearchResultsProductCustom from './SearchResultsProductCustom.vue'
import SearchResultsProductCustomHtmlElement from './custom/SearchResultsProductCustomHtmlElement.vue'
import SearchResultsProductSingleStarRating from './SearchResultsProductSingleStarRating.vue'
import type { SearchResultsOptionLabels } from '@/types/search-results/SearchResultsOptions'

export default {
  components: {
    SearchResultsProductImage,
    SearchResultsProductTitle,
    SearchResultsProductDescription,
    SearchResultsProductRating,
    SearchResultsProductRegularPrice,
    SearchResultsProductPrice,
    SearchResultsProductAddToCart,
    SearchResultsProductCustom,
    SearchResultsProductCustomHtmlElement,
    SearchResultsProductSingleStarRating
  }
}
</script>
<template>
  <component
    v-if="displayElement"
    :is="elementComponent"
    :item="enhancedItem"
    :options="element"
    :labels="labels"
    :inStock="inStock"
    :link="link"
    :class="{ 'lupa-loading-dynamic-data': isLoadingDynamicData(item?.id) }"
    @productEvent="handleProductEvent"
  >
  </component>
</template>
