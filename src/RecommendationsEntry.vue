<script lang="ts" setup>
import { ref } from 'vue'
import type { ProductRecommendationOptions } from './types/recommendations/RecommendationsOptions'
import Recommendations from './components/recommendations/Recommendations.vue'

defineProps<{ recommendationOptions: ProductRecommendationOptions }>()

const productRecommendations = ref(null)

const fetch = (): void => {
  ;(productRecommendations as any)?.fetch()
}

defineExpose({ fetch })
</script>

<template>
  <Recommendations :options="recommendationOptions" ref="productRecommendations" />
</template>
