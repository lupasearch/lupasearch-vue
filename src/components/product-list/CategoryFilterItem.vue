<script lang="ts" setup>
import type { CategoryFilterOptions } from '@/types/product-list/ProductListOptions'
import { linksMatch } from '@/utils/link.utils'
import { handleRoutingEvent } from '@/utils/routing.utils'
import { computed } from 'vue'

const props = defineProps<{
  options: CategoryFilterOptions
  item: Record<string, string>
}>()

const itemValue = computed(() => props.item ?? {})

const title = computed((): string => {
  return props.options.keys.titleKey ? itemValue.value?.[props.options.keys.titleKey] ?? '' : ''
})

const urlLink = computed((): string => {
  return props.options.keys.urlKey ? itemValue.value?.[props.options.keys.urlKey] ?? '' : ''
})

const isActive = computed((): boolean => {
  return linksMatch(urlLink.value, window.location.origin + window.location.pathname)
})

const hasEventRouting = computed((): boolean => {
  return props.options.routingBehavior === 'event'
})

const handleNavigation = (event?: Event): void => {
  handleRoutingEvent(urlLink.value, event, hasEventRouting.value)
}
</script>
<template>
  <div class="lupa-child-category-item" :class="{ 'lupa-child-category-item-active': isActive }">
    <a data-cy="lupa-child-category-item" :href="urlLink" @click="handleNavigation">
      {{ title }}
    </a>
  </div>
</template>
