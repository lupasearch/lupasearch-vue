<script lang="ts" setup>
import { useDynamicDataStore } from '@/stores/dynamicData'
import { DocumentElementType, type DocumentElement } from '@/types/DocumentElement'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import type { Document } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { getDynamicAttributes, processDisplayCondition, shouldDisplay } from '@/utils/render.utils'

const props = defineProps<{
  item: Document
  element: DocumentElement
  labels?: SearchBoxOptionLabels
  isInStock?: boolean
  link?: string
}>()

const dynamicDataStore = useDynamicDataStore()

const { loading, loadingIds, dynamicDataIdMap } = storeToRefs(dynamicDataStore)

const elementComponent = computed((): string => {
  switch (props.element.type) {
    case DocumentElementType.IMAGE:
      return 'search-box-product-image'
    case DocumentElementType.TITLE:
      return 'search-box-product-title'
    case DocumentElementType.DESCRIPTION:
      return 'search-box-product-description'
    case DocumentElementType.PRICE:
      return 'search-box-product-price'
    case DocumentElementType.REGULARPRICE:
      return 'search-box-product-regular-price'
    case DocumentElementType.CUSTOM:
      return 'search-box-product-custom'
    case DocumentElementType.CUSTOM_HTML:
      return 'search-box-product-custom-html'
    case DocumentElementType.ADDTOCART:
      return 'search-box-product-add-to-cart'
  }
  return 'search-box-product-title'
})

const renderDynamicAttributesOnParentElement = computed((): boolean => {
  return props.element.type !== DocumentElementType.ADDTOCART
})

const displayElement = computed((): boolean => {
  const element = props.element
  const item = enhancedItem.value
  if (!element.display) {
    return true
  }
  return shouldDisplay(element.display, item)
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

const dynamicAttributes = computed((): Record<string, unknown> => {
  return getDynamicAttributes(props.element.dynamicAttributes, enhancedItem.value)
})

const isLoadingDynamicData = (id?: unknown) => {
  return Boolean(props.element.dynamic && id && loading.value && loadingIds?.value[id as string])
}
</script>
<script lang="ts">
import SearchBoxProductImage from './SearchBoxProductImage.vue'
import SearchBoxProductTitle from './SearchBoxProductTitle.vue'
import SearchBoxProductDescription from './SearchBoxProductDescription.vue'
import SearchBoxProductPrice from './SearchBoxProductPrice.vue'
import SearchBoxProductRegularPrice from './SearchBoxProductRegularPrice.vue'
import SearchBoxProductCustom from './SearchBoxProductCustom.vue'
import SearchBoxProductCustomHtml from './SearchBoxProductCustomHtml.vue'
import SearchBoxProductAddToCart from './SearchBoxProductAddToCart.vue'

export default {
  components: {
    SearchBoxProductImage,
    SearchBoxProductTitle,
    SearchBoxProductDescription,
    SearchBoxProductPrice,
    SearchBoxProductRegularPrice,
    SearchBoxProductCustom,
    SearchBoxProductCustomHtml,
    SearchBoxProductAddToCart
  }
}
</script>
<template>
  <template v-if="!$slots.badges">
    <component
      v-if="displayElement"
      :is="elementComponent"
      :item="enhancedItem"
      :options="element"
      :labels="labels"
      :class="{ 'lupa-loading-dynamic-data': isLoadingDynamicData(item?.id) }"
      :inStock="isInStock"
      :dynamic-attributes="dynamicAttributes"
      :link="link"
      v-bind="renderDynamicAttributesOnParentElement && dynamicAttributes"
    >
    </component>
  </template>
  <template v-else>
    <div class="lupa-search-box-element-badge-wrapper">
      <component
        v-if="displayElement"
        :is="elementComponent"
        :item="enhancedItem"
        :options="element"
        :labels="labels"
        :link="link"
        :class="{ 'lupa-loading-dynamic-data': isLoadingDynamicData(item?.id) }"
        :inStock="isInStock"
      >
      </component>
      <slot name="badges" />
    </div>
  </template>
</template>
