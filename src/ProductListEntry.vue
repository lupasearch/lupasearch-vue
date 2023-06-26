<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import { type Ref, ref, computed } from 'vue'
import type { ProductListOptions } from './types/product-list/ProductListOptions'
import ProductList from './components/product-list/ProductList.vue'

const props = defineProps<{
  productListOptions: ProductListOptions
}>()

const productList: Ref<null | any> = ref(null)

const fullProductListOptions = computed((): ProductListOptions => {
  return cloneDeep(props.productListOptions)
})

const fetch = (): void => {
  productList.value?.fetch()
}

defineExpose({ fetch })
</script>

<template>
  <ProductList :options="productListOptions" ref="productList" />
</template>
