<script lang="ts" setup>
import type { Document } from '@getlupa/client-sdk/Types'
import { useSearchBoxStore } from '@/stores/searchBox'
import SearchBoxProduct from './SearchBoxProduct.vue'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import type { DocumentSearchBoxPanel } from '@/types/search-box/SearchBoxPanel'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  items: Document[]
  inputValue: string
  panelOptions: DocumentSearchBoxPanel
  labels?: SearchBoxOptionLabels
}>()

const searchBoxStore = useSearchBoxStore()

const { highlightedItem } = storeToRefs(searchBoxStore)

const highlightedIndex = computed((): number => {
  if (props.panelOptions.queryKey !== highlightedItem.value?.queryKey) {
    return -1
  }
  return highlightedItem.value?.index ?? -1
})
</script>

<template>
  <div id="lupa-search-box-products">
    <template v-if="$slots.productCard">
      <slot
        name="productCard"
        v-for="(item, index) in items"
        :key="index"
        :item="item"
        :panelOptions="panelOptions"
        :labels="labels"
        :highlighted="index === highlightedIndex"
        :inputValue="inputValue"
        @product-click="$emit('product-click')"
      />
    </template>
    <template v-else>
      <SearchBoxProduct
        v-for="(item, index) in items"
        :key="index"
        :item="item"
        :panelOptions="panelOptions"
        :labels="labels"
        :highlighted="index === highlightedIndex"
        :inputValue="inputValue"
        @product-click="$emit('product-click')"
      />
    </template>
  </div>
</template>
