<script lang="ts" setup>
import { RelatedQueryOptions } from '@/types/search-results/RelatedQueryOptions'
import { storeToRefs } from 'pinia'
import { computed, onMounted, Ref, ref, watch } from 'vue'
import { useOptionsStore } from '@/stores/options'
import { DocumentElementType } from '@/types/DocumentElement'
import { SearchQueryResult } from '@getlupa/client-sdk/Types'
import lupaSearchSdk from '@getlupa/client-sdk'
import ProductImage from '@/components/common/ProductImage.vue'

const props = defineProps<{
  query?: string
  options?: RelatedQueryOptions
}>()

const loading = ref(false)
const relatedQueryResult: Ref<SearchQueryResult | null> = ref(null)

const optionsStore = useOptionsStore()
const { searchResultOptions } = storeToRefs(optionsStore)

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

const firstResultItem = computed(() => {
  return relatedQueryResult.value?.items?.[0]
})

const totalItemCount = computed(() => {
  return relatedQueryResult.value?.total ?? 0
})

const searchForRelatedQuery = async (): Promise<void> => {
  if (!props.query) {
    return
  }
  const lupaQuery = { searchText: props.query?.toLowerCase(), limit: 1 }
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
        v-if="firstResultItem && image"
        wrapper-class="lupa-related-query-image-wrapper"
        image-class="lupa-related-query-image"
        :item="firstResultItem"
        :options="image"
      />
    </div>

    <div class="lupa-related-query-label">
      <span class="lupa-related-query-title">{{ query }}</span>
      <span class="lupa-related-query-count" v-if="options?.showCount">({{ totalItemCount }})</span>
    </div>
  </div>
</template>
