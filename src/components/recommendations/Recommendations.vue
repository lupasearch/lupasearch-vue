<script lang="ts" setup>
import lupaSearchSdk from '@getlupa/client-sdk'
import { Carousel, Navigation, Pagination, Slide } from 'vue3-carousel'
import { useOptionsStore } from '@/stores/options'
import type { ProductRecommendationOptions } from '@/types/recommendations/RecommendationsOptions'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import { getProductKey } from '@/utils/string.utils'
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import type { Document } from '@getlupa/client-sdk/Types'
import type { ProductClickTrackingSettings } from '@/types/AnalyticsOptions'
import SearchResultsProductCard from '../search-results/products/product-card/SearchResultsProductCard.vue'
import { useSearchResultStore } from '@/stores/searchResult'
import { storeToRefs } from 'pinia'
import { useScreenStore } from '@/stores/screen'

const props = defineProps<{
  options: ProductRecommendationOptions
}>()

const optionsStore = useOptionsStore()
const searchResultStore = useSearchResultStore()
const screenStore = useScreenStore()

const { columnCount } = storeToRefs(searchResultStore)

const recommendations: Ref<Document[]> = ref([])

const recommendationsType: Ref<'recommendations_original' | 'recommendations_lupasearch'> = ref(
  'recommendations_lupasearch'
)
const loading = ref(true)

const carouselOptions = computed((): any => {
  return props.options.carousel ?? {}
})

const clickTrackingSettings = computed((): ProductClickTrackingSettings => {
  return {
    eventType: 'product_recommendation_click',
    listLabel: recommendationsType.value,
    eventLabel: recommendationsType.value
  }
})

const layoutType = computed(() => {
  return props.options.layoutType ?? 'carousel'
})

const columnSize = computed((): string => `width: ${100 / columnCount.value}%`)

const title = computed(() => {
  return props.options.recommendationLabels?.title ?? ''
})

onMounted(() => {
  loadRecommendations()
  window.addEventListener('resize', handleResize)
  handleResize()
  optionsStore.setSearchResultOptions({
    options: props.options as unknown as SearchResultsOptions
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const getProductKeyAction = (index: number, product: Document): string => {
  return getProductKey(index.toString(), product, props.options.idKey)
}

const handleResize = (): void => {
  const doc = document.documentElement
  doc.style.setProperty('--lupa-full-height', `${window.innerHeight}px`)
  screenStore.setScreenWidth({ width: window.innerWidth })
  searchResultStore.setColumnCount({ width: window.innerWidth, grid: props.options.grid })
}

const loadRecommendations = (): void => {
  if (props.options.abTesting?.enabled) {
    const decisionValue = Math.random()
    if (
      !props.options.abTesting?.originalIds?.length ||
      decisionValue > (props.options.abTesting?.oldRecommenderDisplayRatio ?? 0)
    ) {
      loadLupaRecommendations()
    } else {
      loadOriginalRecommendations()
    }
  } else {
    loadLupaRecommendations()
  }
}

const fetch = (): void => {
  loadRecommendations()
}

const loadOriginalRecommendations = async (): Promise<void> => {
  recommendationsType.value = 'recommendations_original'
  try {
    loading.value = true
    const result = await lupaSearchSdk.queryByIds(
      props.options.queryKey,
      props.options.abTesting?.originalIds ?? [],
      props.options.options
    )
    if (!result.success) {
      return
    }
    recommendations.value = result.items
  } finally {
    loading.value = false
  }
}

const loadLupaRecommendations = async (): Promise<void> => {
  recommendationsType.value = 'recommendations_lupasearch'
  try {
    loading.value = true
    const result = await lupaSearchSdk.recommend(
      props.options.queryKey,
      props.options.itemId,
      props.options.recommendationFilters,
      props.options.options
    )
    if (!result.success) {
      return
    }
    recommendations.value = result.recommended
  } finally {
    loading.value = false
  }
}

defineExpose({ fetch })
</script>

<template>
  <div class="lupa-search-product-recommendations-wrapper">
    <h2 class="lupa-recommendation-section-title" v-if="title">{{ title }}</h2>
    <div v-if="!loading" class="lupa-recommended-products" data-cy="lupa-recommended-products">
      <Carousel v-if="layoutType === 'carousel'" v-bind="carouselOptions" :wrap-around="true">
        <Slide
          v-for="(product, index) in recommendations"
          :key="getProductKeyAction(index, product)"
        >
          <SearchResultsProductCard
            :product="product"
            :options="options"
            :click-tracking-settings="clickTrackingSettings"
          />
        </Slide>
        <template #addons>
          <Navigation />
        </template>
      </Carousel>
      <div v-else class="lupa-products" data-cy="lupa-products">
        <SearchResultsProductCard
          v-for="(product, index) in recommendations"
          :style="columnSize"
          :key="getProductKeyAction(index, product)"
          :product="product"
          :options="options"
          :lupa-click-tracking-type="`recommendedItemClick`"
        />
      </div>
    </div>
  </div>
</template>
