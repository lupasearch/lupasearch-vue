<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import { useTrackingStore } from '@/stores/tracking'
import type { AnalyticsEventType, ProductClickTrackingSettings } from '@/types/AnalyticsOptions'
import { DocumentElementType, type DocumentElement } from '@/types/DocumentElement'
import type { BadgeOptions } from '@/types/search-results/BadgeOptions'
import { ResultsLayoutEnum } from '@/types/search-results/ResultsLayout'
import type { SearchResultsOptionLabels } from '@/types/search-results/SearchResultsOptions'
import type { SearchResultsProductCardOptions } from '@/types/search-results/SearchResultsProductCardOptions'
import { generateLink } from '@/utils/link.utils'
import { handleRoutingEvent } from '@/utils/routing.utils'
import type { Document, ReportableEventType } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import SearchResultsBadgeWrapper from './badges/SearchResultsBadgeWrapper.vue'
import SearchResultsProductCardElement from './elements/SearchResultsProductCardElement.vue'

const props = defineProps<{
  product: Document
  options: SearchResultsProductCardOptions
  isAdditionalPanel?: boolean
  clickTrackingSettings?: ProductClickTrackingSettings
}>()

const clickTrackingSettings = computed(() => props.clickTrackingSettings ?? {})

const searchResultStore = useSearchResultStore()
const optionsStore = useOptionsStore()
const paramsStore = useParamsStore()
const trackingStore = useTrackingStore()

const { layout } = storeToRefs(searchResultStore)
const { searchResultsRoutingBehavior, searchResultOptions, trackingOptions } =
  storeToRefs(optionsStore)

const { query } = storeToRefs(paramsStore)

const isInStock = ref(true)

const listLayoutClass = computed((): string => {
  return layout.value === ResultsLayoutEnum.LIST && !props.isAdditionalPanel
    ? 'lupa-search-result-product-contents-list'
    : ''
})

const badgesOptions = computed((): BadgeOptions => {
  return { ...props.options.badges, product: props.product }
})

const imageElements = computed((): DocumentElement[] => {
  return (
    props.options.elements?.filter((e) => e.type === DocumentElementType.IMAGE && !e.group) ?? []
  )
})

const detailElements = computed((): DocumentElement[] => {
  return (
    props.options.elements?.filter((e) => e.type !== DocumentElementType.IMAGE && !e.group) ?? []
  )
})

const labels = computed((): SearchResultsOptionLabels => {
  return props.options.labels
})

const link = computed((): string => {
  if (!props.options.links?.details) {
    return ''
  }
  return generateLink(props.options.links?.details ?? '', props.product)
})

const hasEventRouting = computed((): boolean => {
  return searchResultsRoutingBehavior.value === 'event'
})

const elementGroups = computed((): string[] => {
  return [
    ...Array.from(
      new Set(props.options.elements?.map((e) => e.group).filter((g): g is string => Boolean(g)))
    )
  ] as string[]
})

const id = computed((): string => {
  return props.options.idKey ? (props.product[props.options.idKey] as string) : ''
})

const title = computed((): string => {
  return props.options.titleKey ? (props.product[props.options.titleKey] as string) : ''
})

const ssr = computed(() => Boolean(optionsStore.searchResultOptions.ssr))

const clickTrackingType = computed((): AnalyticsEventType => {
  if (clickTrackingSettings.value.eventType) {
    return clickTrackingSettings.value.eventType
  }
  return query.value ? 'search_product_click' : 'select_item'
})

const trackingLabel = computed((): string | undefined => {
  if (clickTrackingSettings.value.eventLabel) {
    return clickTrackingSettings.value.eventLabel
  }
  return title.value || id.value || link.value
})

const trackingListLabel = computed((): string | undefined => {
  if (clickTrackingSettings.value.listLabel) {
    return clickTrackingSettings.value.listLabel
  }
  return props.options?.labels?.htmlTitleTemplate
})

const getGroupElements = (group: string): DocumentElement[] => {
  return props.options.elements?.filter((e) => e.group === group) ?? []
}

onMounted((): void => {
  checkIfIsInStock()
})

const checkIfIsInStock = async (): Promise<void> => {
  isInStock.value = props.options.isInStock ? await props.options.isInStock(props.product) : true
}

const handleClick = (): void => {
  trackingStore.trackEvent({
    queryKey: props.options.queryKey,
    data: {
      itemId: id.value,
      searchQuery: query.value,
      type: 'itemClick',
      analytics: {
        type: clickTrackingType.value,
        label: trackingLabel.value ?? '',
        listLabel: trackingListLabel.value,
        items: [props.product],
        itemId: id.value
      },
      options: { allowEmptySearchQuery: true }
    }
  })
  searchResultOptions.value.callbacks?.onProductClick?.({
    queryKey: query.value,
    hasResults: true,
    productId: id.value
  })
}

const handleProductEvent = (item: { type: ReportableEventType }): void => {
  trackingStore.trackEvent({
    queryKey: props.options.queryKey,
    data: {
      itemId: id.value,
      searchQuery: query.value,
      type: item.type,
      analytics:
        item.type === 'addToCart'
          ? {
              type: 'search_add_to_cart',
              label: title.value || id.value || link.value
            }
          : undefined
    }
  })
}

const handleNavigation = (event?: Event): void => {
  handleRoutingEvent(link.value, event, hasEventRouting.value)
}

if (ssr.value) {
  checkIfIsInStock()
}
</script>
<template>
  <div
    id="lupa-search-result-product-card"
    data-cy="lupa-search-result-product-card"
    class="lupa-search-result-product-card"
    :class="!isInStock ? 'lupa-out-of-stock' : ''"
    @click="handleClick"
  >
    <SearchResultsBadgeWrapper :options="badgesOptions" />
    <div :class="['lupa-search-result-product-contents', listLayoutClass]">
      <a class="lupa-search-result-product-image-section" :href="link" @click="handleNavigation">
        <SearchResultsProductCardElement
          class="lupa-search-results-product-element"
          v-for="element in imageElements"
          :item="product"
          :element="element"
          :key="element.key"
          :labels="labels"
          :inStock="isInStock"
          :link="link"
        />
        <SearchResultsBadgeWrapper
          :options="badgesOptions"
          position="image"
          class="lupa-image-badges"
        />
        <div v-if="labels?.outOfStock && !isInStock" class="lupa-out-of-stock">
          {{ labels.outOfStock }}
        </div>
      </a>
      <div class="lupa-search-result-product-details-section">
        <SearchResultsProductCardElement
          class="lupa-search-results-product-element"
          v-for="element in detailElements"
          :item="product"
          :element="element"
          :key="element.key"
          :labels="labels"
          :inStock="isInStock"
          :link="link"
          @productEvent="handleProductEvent"
        />
      </div>
      <div v-for="group of elementGroups" :key="group" :class="'lupa-element-group-' + group">
        <SearchResultsProductCardElement
          class="lupa-search-results-product-element"
          v-for="element in getGroupElements(group)"
          :item="product"
          :element="element"
          :key="element.key"
          :labels="labels"
          :inStock="isInStock"
          :link="link"
          @productEvent="handleProductEvent"
        />
      </div>
    </div>
  </div>
</template>
