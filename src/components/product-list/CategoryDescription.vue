<script lang="ts" setup>
import type { ProductListOptions } from '@/types/product-list/ProductListOptions'
import { computed } from 'vue'

const props = defineProps<{
  options: ProductListOptions
}>()

const description = computed((): string | undefined => {
  return props.options.categories?.current?.description
})

const overviewVisible = computed((): boolean => {
  return Boolean(props.options.categories?.current?.description)
})
</script>

<template>
  <div class="lupa-category-overview" v-if="overviewVisible">
    <div class="lupa-category-description" v-html="description"></div>
  </div>
</template>
