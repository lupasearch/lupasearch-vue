import { DEFAULT_DEEP_SEARCH_OPTIONS } from '@/constants/searchResults.const'
import { useOptionsStore } from '@/stores/options'
import type {
  DeepSearchBestProductsOptions,
  DeepSearchLoaderType,
  DeepSearchOptions,
  DeepSearchRegularOptions
} from '@/types/search-results/DeepSearchOptions'
import { merge } from '@/utils/merger.utils'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export const useDeepSearchOptions = () => {
  const optionsStore = useOptionsStore()

  const { searchResultOptions } = storeToRefs(optionsStore)

  const deepSearchOptions = computed((): DeepSearchOptions => {
    return merge(DEFAULT_DEEP_SEARCH_OPTIONS, searchResultOptions.value?.deepSearch ?? {})
  })

  const enabled = computed(() => {
    return Boolean(deepSearchOptions.value.enabled)
  })

  const mode = computed(() => {
    return deepSearchOptions.value.mode ?? 'regular'
  })

  const isRegularMode = computed(() => {
    return enabled.value && mode.value === 'regular'
  })

  const isBestProductsMode = computed(() => {
    return enabled.value && (mode.value === 'bestProducts' || mode.value === 'clickToTrigger')
  })

  const isClickToTriggerMode = computed(() => {
    return enabled.value && mode.value === 'clickToTrigger'
  })

  const regularOptions = computed((): DeepSearchRegularOptions => {
    return deepSearchOptions.value.regular ?? {}
  })

  const bestProductsOptions = computed((): DeepSearchBestProductsOptions => {
    return deepSearchOptions.value.bestProducts ?? {}
  })

  const precheckEnabled = computed(() => {
    return isRegularMode.value && Boolean(regularOptions.value.precheck)
  })

  const loaderType = computed((): DeepSearchLoaderType => {
    return regularOptions.value.loader ?? 'dialog'
  })

  return {
    deepSearchOptions,
    enabled,
    mode,
    isRegularMode,
    isBestProductsMode,
    isClickToTriggerMode,
    regularOptions,
    bestProductsOptions,
    precheckEnabled,
    loaderType
  }
}
