<script lang="ts" setup>
import { computed } from 'vue'
import type { DiscountBadgeElement } from '@/types/search-results/BadgeOptions'
import { useOptionsStore } from '@/stores/options'
import { storeToRefs } from 'pinia'
import { formatPrice } from '@/utils/price.utils'

const props = defineProps<{ badge: DiscountBadgeElement }>()

const optionStore = useOptionsStore()
const { searchResultOptions } = storeToRefs(optionStore)

const className = computed((): string => {
  return props.badge.className ?? ''
})

const discountValue = computed((): number => {
  if (props.badge.discountKey) {
    return props.badge.product?.[props.badge.discountKey] ?? 0
  }
  if (props.badge.regularPriceKey && props.badge.finalPriceKey) {
    const regularPrice = +props.badge.product?.[props.badge.regularPriceKey] as number
    const finalPrice = +props.badge.product?.[props.badge.finalPriceKey] as number
    if (!regularPrice || !finalPrice) {
      return 0
    }
    if (props.badge.discountType === 'percentage') {
      return ((regularPrice - finalPrice) / regularPrice) * 100
    } else {
      return regularPrice - finalPrice
    }
  }
  return 0
})

const discountStringValue = computed((): string => {
  return props.badge.discountType === 'percentage'
    ? discountValue.value.toFixed(0)
    : formatPrice(
        discountValue.value,
        searchResultOptions.value?.labels?.currency,
        searchResultOptions.value?.labels?.priceSeparator
      )
})

const hasDiscount = computed((): boolean => {
  return Boolean(discountValue.value) && discountValue.value > 0
})

const discount = computed((): string => {
  const defaultPostfix = props.badge.discountType === 'percentage' ? ' %' : ''
  const prefix = props.badge.labels?.prefix ?? '- '
  const postfix = props.badge.labels?.postfix ?? defaultPostfix
  return `${prefix}${discountStringValue.value}${postfix}`
})
</script>
<template>
  <div v-if="hasDiscount" :class="className" class="lupa-discount-badge">{{ discount }}</div>
</template>
