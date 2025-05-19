<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useSearchResultStore } from '@/stores/searchResult'
import type { AddToCartElement } from '@/types/DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  item: Document
  options: AddToCartElement
  inStock?: boolean
  dynamicAttributes: Record<string, unknown>
  link?: string
}>()

const inStockValue = computed(() => props.inStock ?? true)

const searchResultStore = useSearchResultStore()
const { addToCartAmount } = storeToRefs(searchResultStore)

const emit = defineEmits(['productEvent'])

const loading = ref(false)

const label = computed((): string => {
  return props.options.labels.addToCart
})

const handleClick = async (): Promise<void> => {
  loading.value = true

  if (props.options.emitEvent) {
    const event = new CustomEvent(props.options.emitEvent, { detail: { item: props.item } })
    window.dispatchEvent(event)
  }

  if (props.options.action) {
    await props.options.action(props.item, addToCartAmount.value)
  }
  emit('productEvent', { type: 'addToCart' })

  loading.value = false
}

const hasLink = computed((): boolean => {
  return Boolean(props.link && props.options.link)
})
</script>

<template>
  <div class="lupa-search-box-add-to-cart-wrapper">
    <div class="lupa-search-box-product-addtocart">
      <button
        v-if="hasLink"
        :class="loading ? 'lupa-add-to-cart-loading' : 'lupa-add-to-cart'"
        data-cy="lupa-add-to-cart"
        :disabled="!inStockValue || loading"
        v-bind="dynamicAttributes"
        @click="handleClick"
      >
        <a :href="link">
          {{ label }}
        </a>
      </button>
      <button
        v-else
        @click.stop.prevent="handleClick"
        :class="loading ? 'lupa-add-to-cart-loading' : 'lupa-add-to-cart'"
        data-cy="lupa-add-to-cart"
        type="button"
        :disabled="!inStockValue || loading"
        v-bind="dynamicAttributes"
      >
        {{ label }}
      </button>
    </div>
  </div>
</template>
