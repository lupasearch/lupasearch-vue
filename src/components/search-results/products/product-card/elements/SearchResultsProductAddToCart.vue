<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useSearchResultStore } from '@/stores/searchResult'
import type { AddToCartElement } from '@/types/DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { useOptionsStore } from '@/stores/options'

const props = defineProps<{
  item: Document
  options: AddToCartElement
  inStock: boolean
  dynamicAttributes: Record<string, unknown>
  link?: string
}>()

const inStockValue = computed(() => props.inStock ?? true)

const searchResultStore = useSearchResultStore()
const optionsStore = useOptionsStore()
const { searchResultOptions } = storeToRefs(optionsStore)
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

const productCardIsClickable = computed((): boolean => {
  return searchResultOptions.value.isLink
})

const hasLink = computed((): boolean => {
  return Boolean(props.link && props.options.link)
})

const addToCartButtonClass = computed((): Record<string, boolean> => {
  return {
    [props.options.className]: Boolean(props.options.className),
    'lupa-add-to-cart-loading': loading.value,
    'lupa-add-to-cart': !loading.value
  }
})

const handleClick = async (e: Event): Promise<void> => {
  if (productCardIsClickable.value && !hasLink.value) {
    e.preventDefault()
  }
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
        v-if="hasLink"
        :class="addToCartButtonClass"
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
        :id="id"
        :class="addToCartButtonClass"
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
