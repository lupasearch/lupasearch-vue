<script lang="ts" setup>
import {
  BadgeType,
  type BadgeOptions,
  type BadgeElement
} from '@/types/search-results/BadgeOptions'
import SearchResultGeneratedBadges from './SearchResultGeneratedBadges.vue'
import { computed } from 'vue'
import type { AnchorPosition } from '@/types/search-results/SearchResultsProductCardOptions'

const props = defineProps<{ position?: 'card' | 'image'; options: BadgeOptions }>()

const positionValue = computed(() => props.position ?? 'card')

const anchorPosition = computed((): AnchorPosition => {
  return props.options.anchor
})

const badges = computed((): BadgeElement[] => {
  if (!props.options.elements) {
    return []
  }
  return props.options.elements
    .filter((e) => !e.display || e.display(props.options.product ?? {}))
    .map((x) => {
      return {
        ...x,
        value: (props.options.product?.[x.key] as string) || 'badge',
        product: props.options.product
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
    default:
      return 'CustomBadge'
  }
}
</script>
<script lang="ts">
import CustomBadge from './CustomBadge.vue'
import TextBadge from './TextBadge.vue'
import ImageBadge from './ImageBadge.vue'

export default {
  components: {
    CustomBadge,
    TextBadge,
    ImageBadge
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
      <SearchResultGeneratedBadges v-if="position === 'card'" :options="options" />
    </div>
  </div>
</template>
