<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import { type Ref, ref, computed } from 'vue'
import type { ProductListOptions } from './types/product-list/ProductListOptions'
import ProductList from './components/product-list/ProductList.vue'
import { useSearchResultStore } from './stores/searchResult'

const props = defineProps<{
  productListOptions: ProductListOptions
}>()

const productList: Ref<null | any> = ref(null)
const searchResultsStore = useSearchResultStore()

const fullProductListOptions = computed((): ProductListOptions => {
  return cloneDeep(props.productListOptions)
})

const fetch = (): void => {
  if (props.productListOptions.hideResultsOnReload) {
    searchResultsStore.clearSearchResult()
    searchResultsStore.setLoading(true)
  }
  productList.value?.fetch()
}

defineExpose({ fetch })
</script>

<template>
  <ProductList :options="fullProductListOptions" ref="productList" />
</template>
