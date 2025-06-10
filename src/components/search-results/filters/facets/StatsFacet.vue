<script lang="ts" setup>
import { CURRENCY_KEY_INDICATOR } from '@/constants/global.const'
import { GLOBAL_CURRENCY_CONFIG } from '@/constants/currency.config'
import { useOptionsStore } from '@/stores/options'
import type { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import { formatRange } from '@/utils/filter.utils'
import { formatPriceSummary } from '@/utils/price.utils'
import { normalizeFloat } from '@/utils/string.utils'
import type { FacetGroupTypeStats, FilterGroupItemTypeRange } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import Slider from '@vueform/slider'

const props = defineProps<{
  options: ResultFacetOptions
  facet?: FacetGroupTypeStats
  currentFilters?: FilterGroupItemTypeRange
}>()
const emit = defineEmits<{
  (e: 'select', payload: { key: string; value: number[]; type: 'range' }): void
}>()

const facetValue = computed(() => props.facet ?? { key: '', min: 0, max: 100 })
const currentFilters = computed(() => props.currentFilters ?? {})
const innerSliderRange = ref<number[]>([])

const optionsStore = useOptionsStore()
const { searchResultOptions } = storeToRefs(optionsStore)

const rangeLabelFrom = computed(() => props.options.stats?.labels?.from ?? '')
const rangeLabelTo = computed(() => props.options.stats?.labels?.to ?? '')
const separator = computed(() => searchResultOptions.value?.labels?.priceSeparator ?? ',')
const currencyLabel = computed(() => searchResultOptions.value?.labels.currency ?? '')
const currencyTpl = computed(() => searchResultOptions.value?.labels.currencyTemplate ?? '')
const priceKeys = computed(() => searchResultOptions.value?.priceKeys ?? [])
const unit = computed(() => props.options.stats?.units?.[facetValue.value.key] ?? '')

const currencySymbol = computed(() => {
  const cfg = GLOBAL_CURRENCY_CONFIG.currencies.find(
    (c) => c.key === GLOBAL_CURRENCY_CONFIG.selected
  )
  return cfg?.symbol ?? currencyLabel.value
})

const isSliderVisible = computed(() => Boolean(props.options.stats?.slider ?? true))
const isInputVisible = computed(() => Boolean(props.options.stats?.inputs))

const isPrice = computed(
  () =>
    facetValue.value.key.includes(CURRENCY_KEY_INDICATOR) ||
    priceKeys.value.includes(facetValue.value.key)
)
const pricePrecision = computed(() => props.options.stats?.pricePrecisionDigits ?? 2)

const facetMin = computed(() => Math.floor(facetValue.value.min))
const facetMax = computed(() => Math.ceil(facetValue.value.max))

const currentGte = computed<number | undefined>(() =>
  typeof currentFilters.value.gte === 'string'
    ? parseFloat(currentFilters.value.gte)
    : currentFilters.value.gte
)
const currentLte = computed<number | undefined>(() =>
  typeof currentFilters.value.lte === 'string'
    ? parseFloat(currentFilters.value.lte)
    : currentFilters.value.lte
)

const currentMinValue = computed(() =>
  currentGte.value != null ? Math.max(currentGte.value, facetMin.value) : facetMin.value
)
const currentMaxValue = computed(() =>
  currentLte.value != null ? Math.min(currentLte.value, facetMax.value) : facetMax.value
)

const sliderRange = computed<number[]>({
  get: () => {
    if (!innerSliderRange.value.length) {
      return [currentMinValue.value, currentMaxValue.value]
    }
    return [
      Math.max(innerSliderRange.value[0], facetMin.value),
      Math.min(innerSliderRange.value[1], facetMax.value)
    ]
  },
  set: (v) => {
    innerSliderRange.value = v
  }
})

const fromValue = computed<string>({
  get: () =>
    isPrice.value
      ? sliderRange.value[0].toFixed(pricePrecision.value).replace('.', separator.value)
      : `${sliderRange.value[0]}`,
  set: (sv) => {
    let v = normalizeFloat(sv)
    if (v < facetMin.value) v = facetMin.value
    if (!v || v > facetMax.value) return
    innerSliderRange.value = [v, sliderRange.value[1]]
    handleInputChange()
  }
})
const toValue = computed<string>({
  get: () =>
    isPrice.value
      ? sliderRange.value[1].toFixed(pricePrecision.value).replace('.', separator.value)
      : `${sliderRange.value[1]}`,
  set: (sv) => {
    let v = normalizeFloat(sv)
    if (v > facetMax.value) v = facetMax.value
    if (!v || v < facetMin.value) return
    innerSliderRange.value = [sliderRange.value[0], v]
    handleInputChange()
  }
})

const isIntegerRange = computed(
  () => Number.isInteger(currentMinValue.value) && Number.isInteger(currentMaxValue.value)
)
const customInterval = computed(() => props.options.stats?.interval)
const interval = computed(() => customInterval.value ?? (isIntegerRange.value ? 1 : -1))

const sliderInputFormat = computed<string | undefined>(() =>
  isPrice.value ? `[0-9]+([${separator.value}][0-9]{1,2})?` : undefined
)

const sliderAria = computed(() => ({
  'aria-label': props.options.stats?.labels?.sliderDotAriaLabel
    ? `${props.options.stats.labels.sliderDotAriaLabel} – ${props.facet?.label}`
    : `Range slider control for ${props.facet?.label}`
}))
const ariaLabelFrom = computed(
  () =>
    `${props.facet?.label ?? ''} ${props.options.stats?.labels?.ariaFrom ?? rangeLabelFrom.value}`
)
const ariaLabelTo = computed(
  () => `${props.facet?.label ?? ''} ${props.options.stats?.labels?.ariaTo ?? rangeLabelTo.value}`
)

const statsSummary = computed<string>(() => {
  const [min, max] = sliderRange.value
  if (isPrice.value) {
    return formatPriceSummary([min, max], currencySymbol.value, separator.value, currencyTpl.value)
  }
  if (unit.value) {
    return `${min} ${unit.value} – ${max} ${unit.value}`
  }
  return formatRange({ gte: min, lte: max })
})

watch(currentMinValue, () => {
  innerSliderRange.value = []
})
watch(currentMaxValue, () => {
  innerSliderRange.value = []
})

function handleInputChange() {
  if (innerSliderRange.value.length < 2) return
  if (sliderRange.value[0] === currentGte.value && sliderRange.value[1] === currentLte.value) return
  applyChange()
}
function applyChange() {
  emit('select', {
    key: facetValue.value.key,
    value: sliderRange.value,
    type: 'range'
  })
}
function handleDragging(v: number[]) {
  innerSliderRange.value = v
}
</script>

<template>
  <div class="lupa-search-result-facet-stats-values">
    <div class="lupa-stats-facet-summary" v-if="!isInputVisible">
      {{ statsSummary }}
    </div>

    <div class="lupa-stats-facet-summary-input" v-else>
      <div class="lupa-stats-from">
        <div class="lupa-stats-range-label" v-if="rangeLabelFrom">
          {{ rangeLabelFrom }}
        </div>
        <input
          v-model.lazy="fromValue"
          type="text"
          maxlength="8"
          :min="facetMin"
          :max="facetMax"
          :pattern="sliderInputFormat"
          :aria-label="ariaLabelFrom"
        />
        <span v-if="isPrice">{{ currencySymbol }}</span>
        <span v-if="unit"> {{ unit }}</span>
      </div>

      <div class="lupa-stats-separator"></div>

      <div class="lupa-stats-to">
        <div class="lupa-stats-range-label" v-if="rangeLabelTo">
          {{ rangeLabelTo }}
        </div>
        <input
          v-model.lazy="toValue"
          type="text"
          maxlength="8"
          :min="facetMin"
          :max="facetMax"
          :pattern="sliderInputFormat"
          :aria-label="ariaLabelTo"
        />
        <span v-if="isPrice">{{ currencySymbol }}</span>
        <span v-if="unit"> {{ unit }}</span>
      </div>
    </div>

    <div class="lupa-stats-slider-wrapper" v-if="isSliderVisible">
      <Slider
        class="slider"
        :tooltips="false"
        :min="facetMin"
        :max="facetMax"
        :step="interval"
        :lazy="true"
        :aria="sliderAria"
        v-model="sliderRange"
        @slide="handleDragging"
        @set="applyChange"
      />
    </div>
  </div>
</template>
