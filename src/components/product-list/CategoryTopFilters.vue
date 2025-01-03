<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { ProductListOptions } from '@/types/product-list/ProductListOptions'
import { handleRoutingEvent } from '@/utils/routing.utils'
import SearchResultsToolbar from '../search-results/products/SearchResultsToolbar.vue'
import { useSearchResultStore } from '@/stores/searchResult'
import CategoryFilterItem from './CategoryFilterItem.vue'

const props = defineProps<{
  options: ProductListOptions
}>()

const searchResultsStore = useSearchResultStore()
const { relatedCategoryChildren } = storeToRefs(searchResultsStore)

const hasBackButton = computed((): boolean => {
  return Boolean(props.options.categories?.back?.title)
})

const hasRelatedCategoryChildren = computed((): boolean => {
  return relatedCategoryChildren.value?.length > 0
})

const backTitle = computed((): string | undefined => {
  return props.options.categories?.back?.title
})

const backUrlLink = computed((): string | undefined => {
  return props.options.categories?.back?.url ?? ''
})

const hasEventRouting = computed((): boolean => {
  return props.options.routingBehavior === 'event'
})

const categoryOptions = computed(() => {
  return props.options.categories
})

const handleNavigationBack = (event?: Event): void => {
  if (!backUrlLink.value) {
    return
  }
  handleRoutingEvent(backUrlLink.value, event, hasEventRouting.value)
}

const getCategoryKey = (item: Record<string, string>): string => {
  return (
    item?.[categoryOptions.value?.keys?.titleKey ?? ''] +
    item?.[categoryOptions.value?.keys?.urlKey ?? '']
  )
}
</script>

<template>
  <div
    class="lupa-category-top-mobile-filters"
    :class="{
      'lupa-has-back-button': hasBackButton,
      'has-related-category-children': hasRelatedCategoryChildren
    }"
  >
    <div class="lupa-top-mobile-filter-wrapper">
      <div class="lupa-category-back" v-if="hasBackButton">
        <a data-cy="lupa-category-back" :href="backUrlLink" @click="handleNavigationBack">
          {{ backTitle }}
        </a>
      </div>
      <div v-if="hasRelatedCategoryChildren" class="lupa-child-category-list">
        <CategoryFilterItem
          v-for="child of relatedCategoryChildren"
          :key="getCategoryKey(child)"
          :item="child"
          :options="categoryOptions"
        />
      </div>
      <SearchResultsToolbar
        class="lupa-toolbar-mobile"
        pagination-location="top"
        :options="options"
      />
    </div>
  </div>
</template>
