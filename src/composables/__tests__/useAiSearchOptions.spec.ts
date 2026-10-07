import { createPinia, setActivePinia } from 'pinia'
import { useAiSearchOptions } from '../useAiSearchOptions'
import { useOptionsStore } from '@/stores/options'
import { DEFAULT_AI_SEARCH_OPTIONS } from '@/constants/searchResults.const'
import type { AiSearchOptions } from '@/types/search-results/AiSearchOptions'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'

const setAiSearchOptions = (aiSearch?: AiSearchOptions) => {
  const optionsStore = useOptionsStore()
  optionsStore.setSearchResultOptions({
    options: { aiSearch } as unknown as SearchResultsOptions
  })
}

describe('useAiSearchOptions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should be disabled with default options when aiSearch is not set', () => {
    setAiSearchOptions(undefined)
    const { enabled, mode, isRegularMode, isBestProductsMode, precheckEnabled, aiSearchOptions } =
      useAiSearchOptions()

    expect(enabled.value).toBe(false)
    expect(mode.value).toBe('regular')
    expect(isRegularMode.value).toBe(false)
    expect(isBestProductsMode.value).toBe(false)
    expect(precheckEnabled.value).toBe(false)
    expect(aiSearchOptions.value).toEqual(DEFAULT_AI_SEARCH_OPTIONS)
  })

  it('should merge user options with defaults', () => {
    setAiSearchOptions({
      enabled: true,
      regular: { precheck: true, labels: { clear: 'Rodyti visus rezultatus' } }
    })
    const { isRegularMode, precheckEnabled, regularOptions, bestProductsOptions } =
      useAiSearchOptions()

    expect(isRegularMode.value).toBe(true)
    expect(precheckEnabled.value).toBe(true)
    expect(regularOptions.value.labels?.clear).toBe('Rodyti visus rezultatus')
    expect(regularOptions.value.labels?.loading).toBe(
      DEFAULT_AI_SEARCH_OPTIONS.regular?.labels?.loading
    )
    expect(bestProductsOptions.value.limit).toBe(3)
  })

  it('should treat clickToTrigger as a best products mode', () => {
    setAiSearchOptions({ enabled: true, mode: 'clickToTrigger', regular: { precheck: true } })
    const { isRegularMode, isBestProductsMode, isClickToTriggerMode, precheckEnabled } =
      useAiSearchOptions()

    expect(isRegularMode.value).toBe(false)
    expect(isBestProductsMode.value).toBe(true)
    expect(isClickToTriggerMode.value).toBe(true)
    expect(precheckEnabled.value).toBe(false)
  })

  it('should not enable any mode when disabled', () => {
    setAiSearchOptions({ enabled: false, mode: 'bestProducts' })
    const { isBestProductsMode } = useAiSearchOptions()

    expect(isBestProductsMode.value).toBe(false)
  })
})
