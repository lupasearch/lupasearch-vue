<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch } from 'vue'
import type { Document, SearchQueryResult } from '@getlupa/client-sdk/Types'
import { useSearchBoxStore } from '@/stores/searchBox'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import type { DocumentSearchBoxPanel } from '@/types/search-box/SearchBoxPanel'
import SearchBoxProducts from './SearchBoxProducts.vue'
import { debounce } from '@/utils/debounce.utils'
import { useDynamicDataStore } from '@/stores/dynamicData'
import type { SdkOptions } from '@/types/General'

const props = defineProps<{
  panel: DocumentSearchBoxPanel
  inputValue: string
  options: SdkOptions
  labels?: SearchBoxOptionLabels
  debounce?: number
}>()

const searchBoxStore = useSearchBoxStore()
const dynamicDataStore = useDynamicDataStore()

const { docResults } = storeToRefs(searchBoxStore)

const emit = defineEmits(['fetched'])

const searchResult = computed((): SearchQueryResult | null => {
  return docResults.value[props.panel.queryKey] ?? null
})

const inputValueProp = computed(() => props.inputValue)

onMounted(() => {
  getItemsDebounced()
})

watch(inputValueProp, () => {
  getItemsDebounced()
})

const enhancePanelData = async (): Promise<void> => {
  await dynamicDataStore.enhanceSearchResultsWithDynamicData({
    result: searchResult.value,
    mode: 'searchBox'
  })
}

const enhanceDataDebounced = debounce(enhancePanelData, props.debounce)

const getItems = (): void => {
  searchBoxStore
    .queryDocuments({
      queryKey: props.panel.queryKey,
      publicQuery: { searchText: props.inputValue, limit: props.panel.limit },
      options: props.options
    })
    .then(({ result }) => {
      if (!result?.items.length) {
        return
      }
      emit('fetched', {
        items: result.items,
        type: props.panel.type
      })
      enhanceDataDebounced()
    })
}

const getItemsDebounced = debounce(getItems, props.debounce)
</script>

<template>
  <SearchBoxProducts
    :items="searchResult?.items ?? []"
    :panelOptions="panel"
    :labels="labels"
    :inputValue="inputValue"
    @product-click="$emit('product-click')"
  >
    <template v-if="$slots.productCard" #productCard="props">
      <slot name="productCard" v-bind="props" />
    </template>
  </SearchBoxProducts>
</template>
