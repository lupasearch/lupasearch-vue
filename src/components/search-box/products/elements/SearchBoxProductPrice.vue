<script lang="ts" setup>
import { computed } from 'vue'
import type { RegularPriceDocumentElement } from '@/types/DocumentElement'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import { formatPrice } from '@/utils/price.utils'
import type { Document } from '@getlupa/client-sdk/Types'

const props = defineProps<{
  item: Document
  options: RegularPriceDocumentElement
  labels?: SearchBoxOptionLabels
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
  <div class="lupa-search-box-product-price">
    <strong>{{ price }}</strong>
  </div>
</template>
