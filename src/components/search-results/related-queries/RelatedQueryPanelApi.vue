<script lang="ts" setup>
import { RelatedQueryOptions } from '@/types/search-results/RelatedQueryOptions'
import { storeToRefs } from 'pinia'
import { computed, onMounted, Ref, ref, watch } from 'vue'
import { useOptionsStore } from '@/stores/options'
import { DocumentElementType } from '@/types/DocumentElement'
import type { Document, RelatedQuery, SearchQueryResult } from '@getlupa/client-sdk/Types'
import lupaSearchSdk from '@getlupa/client-sdk'
import ProductImage from '@/components/common/ProductImage.vue'
import { useSearchResultStore } from '@/stores/searchResult'

const props = defineProps<{
  relatedQuery: RelatedQuery
  options?: RelatedQueryOptions
}>()

const itemToDisplay = computed((): Document | undefined => {
  return props.relatedQuery.topItems?.[0]
})

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

const query = computed(() => {
  return props.relatedQuery.action === 'FILTER'
    ? props.relatedQuery.filterValue
    : props.relatedQuery.query ?? ''
})

const totalItemCount = computed(() => {
  return props.relatedQuery.total ?? 0
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
