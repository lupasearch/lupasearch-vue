<script lang="ts" setup>
import type { ProductListOptions } from '@/types/product-list/ProductListOptions'
import SearchResults from '../search-results/SearchResults.vue'
import CategoryDescription from './CategoryDescription.vue'
import { computed, ref } from 'vue'

const props = defineProps<{
  options: ProductListOptions
}>()

const searchResults = ref(null)

const componentOptions = computed((): ProductListOptions => {
  return {
    ...props.options,
    filters: {
      ...props.options.filters,
      categories: props.options.categories
    }
  }
})

const fetch = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(searchResults.value as any)?.handleMounted()
}

defineExpose({ fetch })
</script>

<template>
  <div>
    <SearchResults
      :options="componentOptions"
      :initial-filters="options.initialFilters"
      :is-product-list="true"
      ref="searchResults"
    >
      <CategoryDescription :options="options" />
    </SearchResults>
  </div>
</template>
