<script lang="ts" setup>
import { CURRENCY_KEY_INDICATOR } from '@/constants/global.const'
import { useOptionsStore } from '@/stores/options'
import type { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import { formatRange } from '@/utils/filter.utils'
import { formatPriceSummary } from '@/utils/price.utils'
import { normalizeFloat } from '@/utils/string.utils'
import type { FacetGroupTypeStats, FilterGroupItemTypeRange } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed, ref, watch, onMounted } from 'vue'
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
const optionsStore = useOptionsStore()
const { searchResultOptions } = storeToRefs(optionsStore)
const { multiCurrency } = storeToRefs(useOptionsStore())
const rangeLabelFrom = computed(() => props.options.stats?.labels?.from ?? '')
const rangeLabelTo = computed(() => props.options.stats?.labels?.to ?? '')
const separator = computed(() => searchResultOptions.value?.labels?.priceSeparator ?? ',')
const currencyLabel = computed(() => searchResultOptions.value?.labels.currency ?? '')
const currencyTpl = computed(() => searchResultOptions.value?.labels.currencyTemplate ?? '')
const priceKeys = computed(() => searchResultOptions.value?.priceKeys ?? [])
const unit = computed(() => props.options.stats?.units?.[facetValue.value.key] ?? '')

const currencySymbol = computed(() => {
  const cfg = multiCurrency.value.currencies.find((c) => c.key === multiCurrency.value.selected)
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
const currencyConfig = computed(
  () =>
    multiCurrency.value.currencies.find((c) => c.key === multiCurrency.value.selected) ?? {
      key: '',
      symbol: currencyLabel.value,
      multiplier: 1
    }
)

const currencyMultiplier = computed(() => (isPrice.value ? currencyConfig.value.multiplier : 1))

const facetMin = computed(() => Math.floor(facetValue.value.min * currencyMultiplier.value))
const facetMax = computed(() => Math.ceil(facetValue.value.max * currencyMultiplier.value))
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

const innerSliderRange = ref<number[]>([currentMinValue.value, currentMaxValue.value])

const sliderRange = computed<number[]>({
  get: () => {
    if (innerSliderRange.value.length === 2) {
      return [
        Math.max(innerSliderRange.value[0], facetMin.value),
        Math.min(innerSliderRange.value[1], facetMax.value)
      ]
    }
    return [facetMin.value, facetMax.value]
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
    return formatPriceSummary(
      [min, max],
      currencyLabel.value,
      separator.value,
      currencyTpl.value,
      multiCurrency.value
    )
  }
  if (unit.value) {
    return `${min} ${unit.value} – ${max} ${unit.value}`
  }
  return formatRange({ gte: min, lte: max })
})

function handleInputChange() {
  if (innerSliderRange.value.length < 2) return
  if (sliderRange.value[0] === currentGte.value && sliderRange.value[1] === currentLte.value) return
  applyChange()
}
function applyChange() {
  const toBase = (x: number) => x / currencyMultiplier.value
  emit('select', {
    key: facetValue.value.key,
    value: sliderRange.value.map(toBase) as [number, number],
    type: 'range'
  })
}
function handleDragging(v: number[]) {
  innerSliderRange.value = v
}

onMounted(() => {
  innerSliderRange.value = [currentMinValue.value, currentMaxValue.value]
})

watch(
  () => [currentMinValue.value, currentMaxValue.value],
  ([newMin, newMax]) => {
    innerSliderRange.value = [newMin, newMax]
  }
)
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
