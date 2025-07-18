<script lang="ts" setup>
import {
  BadgeType,
  type BadgeOptions,
  type BadgeElement
} from '@/types/search-results/BadgeOptions'
import SearchResultGeneratedBadges from './SearchResultGeneratedBadges.vue'
import { computed } from 'vue'
import type { AnchorPosition } from '@/types/search-results/SearchResultsProductCardOptions'
import { processDisplayCondition, shouldDisplay } from '@/utils/render.utils'

const props = defineProps<{ position?: 'card' | 'image'; options: BadgeOptions }>()

const dynamicDataStore = useDynamicDataStore()
const { dynamicDataIdMap } = storeToRefs(dynamicDataStore)

const positionValue = computed(() => props.position ?? 'card')

const anchorPosition = computed((): AnchorPosition => {
  return props.options.anchor
})

const enhancedProduct = computed((): Document => {
  if (!props.options.product?.id) {
    return props.options.product
  }
  const enhancementData = dynamicDataIdMap.value?.[props.options.product?.id as string] ?? {}
  return {
    ...props.options.product,
    ...enhancementData
  }
})

const displayBadge = (element: BadgeElement) => {
  const item = props.options.product ?? {}
  if (!element.display) {
    return true
  }
  return shouldDisplay(element.display, item)
}

const badges = computed((): BadgeElement[] => {
  if (!props.options.elements) {
    return []
  }
  return props.options.elements
    .filter((e) => displayBadge(e))
    .map((x) => {
      return {
        ...x,
        value: (enhancedProduct.value?.[x.key] as string) || 'badge',
        product: enhancedProduct.value
      }
    })
})

const displayBadges = computed((): BadgeElement[] => {
  return positionValue.value === 'card'
    ? badges.value.filter((b) => !b.position || b.position === 'card')
    : badges.value.filter((b) => b.position === 'image')
})

const getBadgeComponent = (type: string): string => {
  switch (type) {
    case BadgeType.TEXT:
      return 'TextBadge'
    case BadgeType.IMAGE:
      return 'ImageBadge'
    case BadgeType.CUSTOM_HTML:
      return 'CustomBadge'
    case BadgeType.DISCOUNT:
      return 'DiscountBadge'
    default:
      return 'CustomBadge'
  }
}
</script>
<script lang="ts">
import CustomBadge from './CustomBadge.vue'
import TextBadge from './TextBadge.vue'
import ImageBadge from './ImageBadge.vue'
import { useDynamicDataStore } from '@/stores/dynamicData'
import { storeToRefs } from 'pinia'
import DiscountBadge from './DiscountBadge.vue'

export default {
  components: {
    CustomBadge,
    TextBadge,
    ImageBadge,
    DiscountBadge
  }
}
</script>
<template>
  <div id="lupa-search-results-badges">
    <div id="lupa-badges" :class="anchorPosition">
      <component
        v-for="(badge, index) in displayBadges"
        :is="getBadgeComponent(badge.type)"
        :key="index"
        :badge="badge"
      />
      <SearchResultGeneratedBadges v-if="positionValue === 'card'" :options="options" />
    </div>
  </div>
</template>
