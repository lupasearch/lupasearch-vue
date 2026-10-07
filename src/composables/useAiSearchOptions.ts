import { DEFAULT_AI_SEARCH_OPTIONS } from '@/constants/searchResults.const'
import { useOptionsStore } from '@/stores/options'
import type {
  AiSearchBestProductsOptions,
  AiSearchLoaderType,
  AiSearchOptions,
  AiSearchRegularOptions
} from '@/types/search-results/AiSearchOptions'
import { merge } from '@/utils/merger.utils'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export const useAiSearchOptions = () => {
  const optionsStore = useOptionsStore()

  const { searchResultOptions } = storeToRefs(optionsStore)

  const aiSearchOptions = computed((): AiSearchOptions => {
    return merge(DEFAULT_AI_SEARCH_OPTIONS, searchResultOptions.value?.aiSearch ?? {})
  })

  const enabled = computed(() => {
    return Boolean(aiSearchOptions.value.enabled)
  })

  const mode = computed(() => {
    return aiSearchOptions.value.mode ?? 'regular'
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

  const regularOptions = computed((): AiSearchRegularOptions => {
    return aiSearchOptions.value.regular ?? {}
  })

  const bestProductsOptions = computed((): AiSearchBestProductsOptions => {
    return aiSearchOptions.value.bestProducts ?? {}
  })

  const precheckEnabled = computed(() => {
    return isRegularMode.value && Boolean(regularOptions.value.precheck)
  })

  const loaderType = computed((): AiSearchLoaderType => {
    return regularOptions.value.loader ?? 'dialog'
  })

  return {
    aiSearchOptions,
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
