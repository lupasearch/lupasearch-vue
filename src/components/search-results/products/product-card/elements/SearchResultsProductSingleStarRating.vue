<script lang="ts" setup>
import { RATING_STAR_HTML } from '@/constants/global.const'
import type { SingleStarRatingElement } from '@/types/DocumentElement'
import { generateLink } from '@/utils/link.utils'
import type { Document } from '@getlupa/client-sdk/Types'
import { computed } from 'vue'

const props = defineProps<{
  item: Document
  options: SingleStarRatingElement
}>()

const totalRatings = computed((): string => {
  return `(${props.options.labels.numberOfRatings}${props.item[props.options.totalKey] || 0})`
})

const ratingLink = computed((): string => {
  if (!props.options.links?.ratingDetails) {
    return ''
  }
  return generateLink(props.options.links.ratingDetails, props.item)
})

const rating = computed((): string => {
  if (!props.options.displayRating) {
    return props.item[props.options.key] as string
  }
  return props.options.displayRating(props.item)
})

const star = computed((): string => {
  return RATING_STAR_HTML
})
</script>
<template>
  <div id="lupa-search-results-rating">
    <div v-html="star" class="lupa-rating lupa-rating-highlighted" />
    <div class="lupa-ratings">{{ rating }}</div>
    <a :href="ratingLink" class="lupa-total-ratings">{{ totalRatings }}</a>
  </div>
</template>
