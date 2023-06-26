<script lang="ts" setup>
import { computed } from 'vue'
import type { RegularPriceDocumentElement } from '@/types/DocumentElement'
import type { SearchResultsOptionLabels } from '@/types/search-results/SearchResultsOptions'
import { formatPrice } from '@/utils/price.utils'
import type { Document } from '@getlupa/client-sdk/Types'

const props = defineProps<{
  item: Document
  options: RegularPriceDocumentElement
  labels: SearchResultsOptionLabels
}>()

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
    class="lupa-search-results-product-regular-price"
    data-cy="lupa-search-results-product-regular-price"
  >
    {{ price }}
  </div>
</template>
