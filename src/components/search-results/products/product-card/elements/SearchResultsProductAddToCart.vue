<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useSearchResultStore } from '@/stores/searchResult'
import type { AddToCartElement } from '@/types/DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  item: Document
  options: AddToCartElement
  inStock: boolean
  dynamicAttributes: Record<string, unknown>
}>()

const inStockValue = computed(() => props.inStock ?? true)

const searchResultStore = useSearchResultStore()
const { addToCartAmount } = storeToRefs(searchResultStore)

const emit = defineEmits(['productEvent'])

const loading = ref(false)

const label = computed((): string => {
  return props.options.labels.addToCart
})

const id = computed(() => {
  const id = props.item.id ?? ''
  return `lupa-add-to-cart-${id}`
})

const handleClick = async (): Promise<void> => {
  loading.value = true

  if (props.options.emitEvent) {
    const event = new CustomEvent(props.options.emitEvent, { detail: { item: props.item } })
    document.dispatchEvent(event)
  }

  if (props.options.action) {
    await props.options.action(props.item, addToCartAmount.value)
  }

  emit('productEvent', { type: 'addToCart' })

  loading.value = false
}
</script>

<template>
  <div class="lupa-search-results-add-to-cart-wrapper">
    <div class="lupa-search-results-product-addtocart">
      <button
        :id="id"
        :class="loading ? 'lupa-add-to-cart-loading' : 'lupa-add-to-cart'"
        data-cy="lupa-add-to-cart"
        :disabled="!inStockValue || loading"
        v-bind="dynamicAttributes"
        @click.stop="handleClick"
      >
        {{ label }}
      </button>
    </div>
  </div>
</template>
