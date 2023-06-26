<script lang="ts" setup>
import { computed } from 'vue'
import type { ProductListOptions } from '@/types/product-list/ProductListOptions'
import { handleRoutingEvent } from '@/utils/routing.utils'
import SearchResultsToolbar from '../search-results/products/SearchResultsToolbar.vue'

const props = defineProps<{
  options: ProductListOptions
}>()

const hasBackButton = computed((): boolean => {
  return Boolean(props.options.categories?.back?.title)
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

const handleNavigationBack = (event?: Event): void => {
  if (!backUrlLink.value) {
    return
  }
  handleRoutingEvent(backUrlLink.value, event, hasEventRouting.value)
}
</script>

<template>
  <div class="lupa-category-top-mobile-filters" :class="{ 'lupa-has-back-button': hasBackButton }">
    <div class="lupa-top-mobile-filter-wrapper">
      <div class="lupa-category-back" v-if="hasBackButton">
        <a data-cy="lupa-category-back" :href="backUrlLink" @click="handleNavigationBack">
          {{ backTitle }}
        </a>
      </div>
      <SearchResultsToolbar
        class="lupa-toolbar-mobile"
        pagination-location="top"
        :options="options"
      />
    </div>
  </div>
</template>
