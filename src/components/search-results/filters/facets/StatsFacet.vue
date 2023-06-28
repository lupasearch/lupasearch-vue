<script lang="ts" setup>
import { CURRENCY_KEY_INDICATOR } from '@/constants/global.const'
import { useOptionsStore } from '@/stores/options'
import type { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import { formatRange } from '@/utils/filter.utils'
import { formatPriceSummary } from '@/utils/price.utils'
import { normalizeFloat } from '@/utils/string.utils'
import type { FacetGroupTypeStats, FilterGroupItemTypeRange } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
// import VueSlider from 'vue-slider-component'

const props = defineProps<{
  options: ResultFacetOptions
  facet?: FacetGroupTypeStats
  currentFilters?: FilterGroupItemTypeRange
}>()

const facetValue = computed(() => props.facet ?? { key: '', min: 0, max: 100 })
const currentFilters = computed(() => props.currentFilters ?? {})

const emit = defineEmits(['select'])

const innerSliderRange = ref([] as number[])

const optionsStore = useOptionsStore()
const { searchResultOptions } = storeToRefs(optionsStore)

const rangeLabelFrom = computed((): string => {
  return props.options.stats?.labels?.from ?? ''
})

const rangeLabelTo = computed((): string => {
  return props.options.stats?.labels?.to ?? ''
})

const currency = computed((): string => {
  return searchResultOptions.value?.labels.currency
})

const isSliderVisible = computed((): boolean => {
  return Boolean(props.options.stats?.slider ?? true)
})

const isInputVisible = computed((): boolean => {
  return Boolean(props.options.stats?.inputs)
})

const fromValue = computed({
  get: () =>
    isPrice.value
      ? sliderRange.value[0].toFixed(2).replace('.', separator.value)
      : `${sliderRange.value[0]}`,
  set: (stringValue) => {
    let value = normalizeFloat(stringValue)
    if (value < facetMin.value) {
      value = facetMin.value
    }
    if (!value || value > facetMax.value) {
      return
    }
    innerSliderRange.value = [value, sliderRange.value[1]]
    handleInputChange()
  }
})

const toValue = computed({
  get: () =>
    isPrice.value
      ? sliderRange.value[1].toFixed(2).replace('.', separator.value)
      : `${sliderRange.value[1]}`,
  set: (stringValue) => {
    let value = normalizeFloat(stringValue)
    if (value > facetMax.value) {
      value = facetMax.value
    }
    if (!value || value < facetMin.value) {
      return
    }
    innerSliderRange.value = [sliderRange.value[0], value]
    handleInputChange()
  }
})

const currentGte = computed((): number | undefined => {
  return typeof currentFilters.value.gte === 'string'
    ? parseFloat(currentFilters.value.gte)
    : currentFilters.value.gte
})

const currentLte = computed((): number | undefined => {
  return typeof currentFilters.value.lt === 'string'
    ? parseFloat(currentFilters.value.lt)
    : currentFilters.value.lt
})

const currentMinValue = computed((): number => {
  return currentGte.value ? Math.max(currentGte.value, facetMin.value) : facetMin.value
})

const currentMaxValue = computed((): number => {
  return currentLte.value ? Math.min(currentLte.value, facetMax.value) : facetMax.value
})

const sliderRange = computed({
  get: () => {
    if (!innerSliderRange.value.length) {
      return [currentMinValue.value, currentMaxValue.value]
    }
    return [
      Math.max(innerSliderRange.value[0], facetMin.value),
      Math.min(innerSliderRange.value[1], facetMax.value)
    ]
  },
  set: (value) => {
    innerSliderRange.value = value
  }
})

const isPrice = computed((): boolean => {
  return facetValue.value.key?.includes(CURRENCY_KEY_INDICATOR)
})

const facetMin = computed((): number => {
  return Math.floor(facetValue.value.min)
})

const facetMax = computed((): number => {
  return Math.ceil(facetValue.value.max)
})

const statsSummary = computed((): string => {
  const [min, max] = sliderRange.value
  return isPrice.value
    ? formatPriceSummary([min, max], currency.value, separator.value)
    : formatRange({ gte: min, lte: max })
})

const separator = computed((): string => {
  return searchResultOptions.value?.labels?.priceSeparator ?? ','
})

const isIntegerRange = computed((): boolean => {
  return Number.isInteger(currentMinValue.value) && Number.isInteger(currentMaxValue.value)
})

const interval = computed((): number => {
  return isIntegerRange.value ? 1 : 0.01
})

const sliderInputFormat = computed((): string | undefined => {
  return isPrice.value ? `[0-9]+([${separator.value}][0-9]{1,2})?` : undefined
})

watch(currentMinValue, () => {
  innerSliderRange.value = []
})

watch(currentMaxValue, () => {
  innerSliderRange.value = []
})

const handleInputChange = (): void => {
  if (innerSliderRange.value.length < 1) {
    return
  }
  if (sliderRange.value[0] === currentGte.value && sliderRange.value[1] === currentLte.value) {
    return
  }
  handleChange()
}

const handleChange = (): void => {
  emit('select', {
    key: facetValue.value.key,
    value: sliderRange.value,
    type: 'range'
  })
}

const handleDragging = (value: number[]): void => {
  innerSliderRange.value = value
}
</script>

<template>
  <div class="lupa-search-result-facet-stats-values">
    <div class="lupa-stats-facet-summary" v-if="!isInputVisible">
      {{ statsSummary }}
    </div>
    <div class="lupa-stats-facet-summary-input" v-else>
      <div>
        <div class="lupa-stats-range-label" v-if="rangeLabelFrom">
          {{ rangeLabelFrom }}
        </div>
        <div class="lupa-stats-from">
          <input
            v-model.lazy="fromValue"
            type="text"
            maxlength="8"
            :max="facetMax"
            :min="facetMin"
            :pattern="sliderInputFormat"
          />
          <span v-if="isPrice">{{ currency }}</span>
        </div>
      </div>
      <div class="lupa-stats-separator"></div>
      <div>
        <div class="lupa-stats-range-label" v-if="rangeLabelTo">
          {{ rangeLabelTo }}
        </div>
        <div class="lupa-stats-to">
          <input
            v-model.lazy="toValue"
            type="text"
            maxlength="8"
            :max="facetMax"
            :min="facetMin"
            :pattern="sliderInputFormat"
          />
          <span v-if="isPrice">{{ currency }}</span>
        </div>
      </div>
    </div>
    <div class="lupa-stats-slider-wrapper" v-if="isSliderVisible">
      <vue-slider
        class="slider"
        tooltip="none"
        :min="facetMin"
        :max="facetMax"
        :lazy="true"
        :silent="true"
        :duration="0.1"
        :interval="interval"
        v-model="sliderRange"
        @change="handleChange"
        @drag-end="handleChange"
        @dragging="handleDragging"
      >
      </vue-slider>
    </div>
  </div>
</template>
