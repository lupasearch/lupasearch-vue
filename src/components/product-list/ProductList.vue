<script lang="ts" setup>
import type { ProductListOptions } from '@/types/product-list/ProductListOptions'
import SearchResults from '../search-results/SearchResults.vue'
import CategoryDescription from './CategoryDescription.vue'
import { computed, ref } from 'vue'
import { processExtractionObject } from '@/utils/extraction.utils'

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

const initialFilters = computed(() => {
  return {
    ...processExtractionObject(props.options.initialFilters)
  }
})

defineExpose({ fetch })
</script>

<template>
  <div>
    <SearchResults
      :options="componentOptions"
      :initial-filters="initialFilters"
      :is-product-list="true"
      ref="searchResults"
    >
      <CategoryDescription :options="options" />
    </SearchResults>
  </div>
</template>
