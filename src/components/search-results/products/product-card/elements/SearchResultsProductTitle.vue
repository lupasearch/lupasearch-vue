<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import type { TitleDocumentElement } from '@/types/DocumentElement'
import { handleRoutingEvent } from '@/utils/routing.utils'
import type { Document } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  item: Document
  options: TitleDocumentElement
  link: string
}>()

const optionsStore = useOptionsStore()
const { searchResultOptions } = storeToRefs(optionsStore)

const title = computed((): string => {
  return props.item[props.options.key] as string
})

const isHtml = computed((): boolean => {
  return props.options.isHtml ?? false
})

const maxLines = computed((): number => {
  return props.options.maxLines
})

const hasEventRouting = computed((): boolean => {
  return searchResultOptions.value.routingBehavior === 'event'
})

const handleNavigation = (event?: Event): void => {
  handleRoutingEvent(props.link, event, hasEventRouting.value)
}
</script>

<template>
  <div
    class="lupa-search-results-product-title"
    :style="`-webkit-line-clamp: ${maxLines}`"
    v-if="isHtml"
    v-html="title"
  ></div>
  <div
    v-else
    class="lupa-search-results-product-title"
    :style="`-webkit-line-clamp: ${maxLines}`"
    :title="title"
  >
    <span v-if="!options.link" class="lupa-search-results-product-title-text">{{ title }}</span>
    <a
      v-if="options.link"
      :href="link"
      class="lupa-search-results-product-title-text lupa-title-link"
      @click="handleNavigation"
      >{{ title }}</a
    >
  </div>
</template>
