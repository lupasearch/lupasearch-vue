<script lang="ts" setup>
import { RelatedQueryOptions } from '@/types/search-results/RelatedQueryOptions'
import { storeToRefs } from 'pinia'
import { computed, onMounted, Ref, ref, watch } from 'vue'
import { useOptionsStore } from '@/stores/options'
import { DocumentElementType } from '@/types/DocumentElement'
import { Document, SearchQueryResult } from '@getlupa/client-sdk/Types'
import lupaSearchSdk from '@getlupa/client-sdk'
import ProductImage from '@/components/common/ProductImage.vue'
import { useSearchResultStore } from '@/stores/searchResult'

const props = defineProps<{
  query?: string
  sourceKey?: string
  options?: RelatedQueryOptions
  existingItemsFromOtherQueries?: Record<string, Document>
}>()

const loading = ref(false)
const relatedQueryResult: Ref<SearchQueryResult | null> = ref(null)

const itemToDisplay = ref<Document | null>(null)

const emit = defineEmits(['loaded'])

const optionsStore = useOptionsStore()
const searchResultStore = useSearchResultStore()

const { searchResultOptions } = storeToRefs(optionsStore)
const { searchResult } = storeToRefs(searchResultStore)

const mainImage = computed(() => {
  return (
    searchResultOptions.value?.elements?.find((e) => e.type === DocumentElementType.IMAGE) ?? ''
  )
})

const image = computed(() => {
  return props.options?.image ?? mainImage?.value ?? ''
})

const queryKey = computed(() => {
  return props.options?.queryKey ?? searchResultOptions.value.queryKey
})

const hasResults = computed(() => {
  return relatedQueryResult.value?.items?.length > 0
})

const totalItemCount = computed(() => {
  return relatedQueryResult.value?.total ?? 0
})

const searchText = computed(() => {
  return props.options.source?.mode === 'filter'
    ? searchResult.value?.searchText
    : props.query?.toLowerCase()
})

const relatedQueryFilters = computed(() => {
  return props.options.source?.mode === 'filter'
    ? {
        [props.sourceKey]: [props.query]
      }
    : {}
})

const searchForRelatedQuery = async (): Promise<void> => {
  if (!props.query) {
    return
  }
  const lupaQuery = {
    searchText: searchText.value,
    limit: 3,
    filters: relatedQueryFilters.value,
    trackTerm: false
  }
  try {
    loading.value = true
    const result = await lupaSearchSdk.query(
      queryKey.value,
      lupaQuery,
      searchResultOptions.value?.options
    )
    if (result.success) {
      relatedQueryResult.value = result
    }
    const firstItem = relatedQueryResult.value?.items?.[0]
    itemToDisplay.value =
      relatedQueryResult?.value?.items?.find(
        (i) => !props.existingItemsFromOtherQueries[`${i.id}`]
      ) ?? firstItem
    emit('loaded', itemToDisplay.value)
  } catch (error) {
    searchResultOptions.value?.options?.onError(error)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.query,
  () => {
    searchForRelatedQuery()
  }
)

onMounted(() => {
  searchForRelatedQuery()
})
</script>
<template>
  <div class="lupa-related-query-item">
    <div class="lupa-related-query-image">
      <ProductImage
        v-if="itemToDisplay && image"
        wrapper-class="lupa-related-query-image-wrapper"
        image-class="lupa-related-query-image"
        :item="itemToDisplay"
        :options="image"
      />
    </div>

    <div class="lupa-related-query-label">
      <span class="lupa-related-query-title">{{ query }}</span>
      <span class="lupa-related-query-count" v-if="options?.showCount">({{ totalItemCount }})</span>
    </div>
  </div>
</template>
