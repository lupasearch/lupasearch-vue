<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { Ref, computed, onMounted, ref, watch } from 'vue'
import lupaSearchSdk from '@getlupa/client-sdk'
import type { Document, SearchQueryResult } from '@getlupa/client-sdk/Types'
import { RelatedSourcePanel } from '@/types/search-box/SearchBoxPanel'
import { SdkOptions } from '@/types/General'
import { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import { useSearchBoxStore } from '@/stores/searchBox'
import { debounce } from '@/utils/debounce.utils'
import SearchBoxProducts from '../products/SearchBoxProducts.vue'
import { SearchBoxPanelType } from '@/index'
import { DocumentSearchBoxPanel } from '@/types/search-box/SearchBoxPanel'

const props = defineProps<{
  panel: RelatedSourcePanel
  inputValue: string
  options: SdkOptions
  labels?: SearchBoxOptionLabels
  debounce?: number
}>()

const searchBoxStore = useSearchBoxStore()

const mounted = ref(false)

const emit = defineEmits(['fetched'])

const { docResults } = storeToRefs(searchBoxStore)

const searchResult: Ref<SearchQueryResult | null> = ref(null)

const options = computed(() => props.options)

const relatedSourceIds = computed(() => {
  const queryKey = props.panel.sourceIds?.queryKey
  if (!queryKey) {
    return []
  }
  const currentDocumentItems: Document[] = docResults?.value[queryKey]?.items ?? []
  const allFieldValues = currentDocumentItems
    .map((item: Document) => item[props.panel.sourceIds.field] as string)
    .flat()
  const uniqueFieldValues = Array.from(new Set(allFieldValues))
  return uniqueFieldValues
})

const relatedSourceIdsString = computed(() => relatedSourceIds.value.join(','))

onMounted(() => {
  getItemsDebounced()
  mounted.value = true
})

watch(relatedSourceIdsString, () => {
  if (mounted) {
    getItemsDebounced()
  }
})

const fetchRelatedItems = async (): Promise<SearchQueryResult> => {
  if (!props.panel.target?.queryKey || !relatedSourceIds.value.length) {
    return { items: [], success: true, searchText: '', total: 0 }
  }
  try {
    const result = await lupaSearchSdk.queryByIds(
      props.panel.target?.queryKey,
      relatedSourceIds.value,
      options.value
    )
    if (!result.success) {
      return { items: [], success: true, searchText: '', total: 0 }
    }
    return result
  } catch (err) {
    console.error(err)
    if (options?.value.onError) {
      options.value.onError(err)
    }
    return { items: [], success: true, searchText: '', total: 0 }
  }
}

const getItems = async (): Promise<void> => {
  searchResult.value = await fetchRelatedItems()
}

const getItemsDebounced = debounce(getItems, props.debounce)

const documentPanelOptions: Ref<DocumentSearchBoxPanel> = computed(() => {
  return {
    ...props.panel,
    type: SearchBoxPanelType.DOCUMENT
  }
})
</script>
<template>
  <SearchBoxProducts
    :items="searchResult?.items ?? []"
    :panelOptions="documentPanelOptions"
    :labels="labels"
    :inputValue="inputValue"
    @product-click="$emit('product-click')"
  >
    <template v-if="$slots.productCard" #productCard="props">
      <slot name="productCard" v-bind="props" />
    </template>
  </SearchBoxProducts>
</template>
