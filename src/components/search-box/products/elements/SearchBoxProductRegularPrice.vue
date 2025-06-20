<script lang="ts" setup>
import { computed } from 'vue'
import type { RegularPriceDocumentElement } from '@/types/DocumentElement'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import { formatPrice } from '@/utils/price.utils'
import type { Document } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { useOptionsStore } from '@/stores/options'

const props = defineProps<{
  item: Document
  options: RegularPriceDocumentElement
  labels?: SearchBoxOptionLabels
}>()

const optionsStore = useOptionsStore()

const className = computed((): string => {
  return props.options.className
})

const { multiCurrency } = storeToRefs(optionsStore)

const price = computed((): string => {
  return formatPrice(
    props.item[props.options.key] as string,
    props.labels?.currency,
    props.labels?.priceSeparator,
    props.labels?.currencyTemplate,
    multiCurrency.value
  )
})
</script>
<template>
  <div :class="className" class="lupa-search-box-product-regular-price">{{ price }}</div>
</template>
