<script lang="ts" setup>
import { RATING_STAR_HTML } from '@/constants/global.const'
import type { RatingElement } from '@/types/DocumentElement'
import { generateLink } from '@/utils/link.utils'
import type { Document } from '@getlupa/client-sdk/Types'
import { computed } from 'vue'

const STAR_COUNT = 5

const props = defineProps<{
  item: Document
  options: RatingElement
}>()

const totalRatings = computed((): string => {
  return `(${props.options.labels.numberOfRatings}${props.item[props.options.totalKey] || 0})`
})

const currentRating = computed((): number => {
  return Math.round((props.item[props.options.key] as number) || 0)
})

const baseStars = computed((): string[] => {
  return new Array(STAR_COUNT).fill(RATING_STAR_HTML)
})

const highlightedStars = computed((): string[] => {
  return new Array(STAR_COUNT).fill(RATING_STAR_HTML)
})

const ratingPercentage = computed((): number => {
  return props.options.getRatingPercentage
    ? props.options.getRatingPercentage(props.item)
    : currentRating.value
})

const ratingLink = computed((): string => {
  if (!props.options.links?.ratingDetails) {
    return ''
  }
  return generateLink(props.options.links.ratingDetails, props.item)
})
</script>
<template>
  <div id="lupa-search-results-rating">
    <div class="lupa-ratings">
      <div class="lupa-ratings-base">
        <div
          v-for="(star, index) in baseStars"
          :key="index"
          v-html="star"
          class="lupa-rating lupa-rating-not-highlighted"
        />
      </div>
      <div class="lupa-rating-wrapper">
        <div class="lupa-ratings-highlighted" :style="{ width: ratingPercentage + '%' }">
          <div
            v-for="(star, index) in highlightedStars"
            :key="index"
            v-html="star"
            class="lupa-rating lupa-rating-highlighted"
          />
        </div>
      </div>
    </div>
    <a :href="ratingLink" class="lupa-total-ratings">{{ totalRatings }}</a>
  </div>
</template>
