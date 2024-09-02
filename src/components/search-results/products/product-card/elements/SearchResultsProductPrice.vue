<script lang="ts" setup>
import { computed } from 'vue'
import type { RegularPriceDocumentElement } from '@/types/DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'
import type { SearchResultsOptionLabels } from '@/types/search-results/SearchResultsOptions'
import { formatPrice } from '@/utils/price.utils'

const props = defineProps<{
  item: Document
  options: RegularPriceDocumentElement
  labels?: SearchResultsOptionLabels
}>()

const className = computed((): string => {
  return props.options.className
})

const price = computed((): string => {
  return formatPrice(
    props.item[props.options.key] as string,
    props.labels?.currency,
    props.labels?.priceSeparator
  )
})
</script>

<template>
  <div
    :class="className"
    class="lupa-search-results-product-price"
    data-cy="lupa-search-results-product-price"
  >
    <strong>{{ price }}</strong>
  </div>
</template>
