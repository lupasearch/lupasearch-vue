<script lang="ts" setup>
import SearchBoxProductElement from './elements/SearchBoxProductElement.vue'
import type { Document } from '@getlupa/client-sdk/Types'
import type { DocumentSearchBoxPanel } from '@/types/search-box/SearchBoxPanel'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import { computed, onMounted, ref } from 'vue'
import { generateLink } from '@/utils/link.utils'
import {
  DocumentElementType,
  ImageDocumentElement,
  type DocumentElement
} from '@/types/DocumentElement'
import SearchResultsBadgeWrapper from '@/components/search-results/products/product-card/badges/SearchResultsBadgeWrapper.vue'
import { BadgeOptions } from '@/types/search-results/BadgeOptions'
import { processDisplayCondition } from '@/utils/render.utils'

const isInStock = ref(true)

const props = defineProps<{
  item: Document
  inputValue: string
  panelOptions: DocumentSearchBoxPanel
  labels?: SearchBoxOptionLabels
  highlighted?: boolean
}>()

const emit = defineEmits(['product-click'])

const link = computed((): string => {
  return generateLink(props.panelOptions.links?.details ?? '', props.item)
})

const badgeOptions = computed((): BadgeOptions => {
  return { ...props.panelOptions.badges, product: props.item }
})

const imageElements = computed((): DocumentElement[] => {
  return props.panelOptions.elements?.filter((e) => e.type === DocumentElementType.IMAGE) ?? []
})

const mainImageElement = computed((): ImageDocumentElement | undefined => {
  return imageElements.value[0] as ImageDocumentElement
})

const widthOverride = computed(() => {
  return mainImageElement.value?.dimensions?.width ?? undefined
})

const heightOverride = computed(() => {
  return mainImageElement.value?.dimensions?.height ?? undefined
})

const imageStyleOverride = computed(() => {
  return mainImageElement.value?.dimensions
    ? {
        width: widthOverride.value ? `${widthOverride.value}px` : undefined,
        height: heightOverride.value ? `${heightOverride.value}px` : undefined,
        minWidth: widthOverride.value ? `${widthOverride.value + 10}px` : undefined
      }
    : {}
})

const detailElements = computed((): DocumentElement[] => {
  return (
    props.panelOptions.elements?.filter(
      (e) => e.type !== DocumentElementType.IMAGE && e.type !== DocumentElementType.ADDTOCART
    ) ?? []
  )
})

const addToCartElement = computed(() => {
  return props.panelOptions.elements?.find((e) => e.type === DocumentElementType.ADDTOCART)
})

const customDocumentHtmlAttributes = computed((): Record<string, unknown> => {
  return props.panelOptions.customDocumentHtmlAttributes?.(props.item) ?? {}
})

const handleClick = (event?: Event): void => {
  emit('product-click', {
    item: props.item,
    eventType: 'itemClick',
    event
  })
}

onMounted((): void => {
  checkIfIsInStock()
})

const processIsInStock = () => {
  return typeof props.panelOptions.isInStock === 'function'
    ? props.panelOptions.isInStock(props.item)
    : processDisplayCondition(props.panelOptions.isInStock, props.item)
}

const checkIfIsInStock = async (): Promise<void> => {
  isInStock.value = props.panelOptions.isInStock ? processIsInStock() : true
}
</script>

<template>
  <a
    class="lupa-search-box-product"
    :class="{ 'lupa-search-box-product-highlighted': highlighted }"
    :href="link"
    v-bind="customDocumentHtmlAttributes"
    data-cy="lupa-search-box-product"
    @click="handleClick"
  >
    <div class="lupa-search-box-product-image-section" :style="imageStyleOverride">
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
      <template v-for="element in detailElements" :key="element.key">
        <SearchBoxProductElement
          class="lupa-search-box-product-element"
          :item="item"
          :element="element"
          :labels="labels"
          :link="link"
        >
          <template #badges v-if="badgeOptions && badgeOptions?.anchorElementKey === element.key">
            <SearchResultsBadgeWrapper :options="badgeOptions" position="card" />
          </template>
        </SearchBoxProductElement>
      </template>
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
