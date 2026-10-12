import { createPinia, setActivePinia } from 'pinia'
import { useDeepSearchOptions } from '../useDeepSearchOptions'
import { useOptionsStore } from '@/stores/options'
import { DEFAULT_DEEP_SEARCH_OPTIONS } from '@/constants/searchResults.const'
import type { DeepSearchOptions } from '@/types/search-results/DeepSearchOptions'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'

const setDeepSearchOptions = (deepSearch?: DeepSearchOptions) => {
  const optionsStore = useOptionsStore()
  optionsStore.setSearchResultOptions({
    options: { deepSearch } as unknown as SearchResultsOptions
  })
}

describe('useDeepSearchOptions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should be disabled with default options when deepSearch is not set', () => {
    setDeepSearchOptions(undefined)
    const { enabled, mode, isRegularMode, isBestProductsMode, precheckEnabled, deepSearchOptions } =
      useDeepSearchOptions()

    expect(enabled.value).toBe(false)
    expect(mode.value).toBe('regular')
    expect(isRegularMode.value).toBe(false)
    expect(isBestProductsMode.value).toBe(false)
    expect(precheckEnabled.value).toBe(false)
    expect(deepSearchOptions.value).toEqual(DEFAULT_DEEP_SEARCH_OPTIONS)
  })

  it('should merge user options with defaults', () => {
    setDeepSearchOptions({
      enabled: true,
      regular: { precheck: true, labels: { clear: 'Rodyti visus rezultatus' } }
    })
    const { isRegularMode, precheckEnabled, regularOptions, bestProductsOptions } =
      useDeepSearchOptions()

    expect(isRegularMode.value).toBe(true)
    expect(precheckEnabled.value).toBe(true)
    expect(regularOptions.value.labels?.clear).toBe('Rodyti visus rezultatus')
    expect(regularOptions.value.labels?.loading).toBe(
      DEFAULT_DEEP_SEARCH_OPTIONS.regular?.labels?.loading
    )
    expect(bestProductsOptions.value.limit).toBe(3)
  })

  it('should treat clickToTrigger as a best products mode', () => {
    setDeepSearchOptions({ enabled: true, mode: 'clickToTrigger', regular: { precheck: true } })
    const { isRegularMode, isBestProductsMode, isClickToTriggerMode, precheckEnabled } =
      useDeepSearchOptions()

    expect(isRegularMode.value).toBe(false)
    expect(isBestProductsMode.value).toBe(true)
    expect(isClickToTriggerMode.value).toBe(true)
    expect(precheckEnabled.value).toBe(false)
  })

  it('should not enable any mode when disabled', () => {
    setDeepSearchOptions({ enabled: false, mode: 'bestProducts' })
    const { isBestProductsMode } = useDeepSearchOptions()

    expect(isBestProductsMode.value).toBe(false)
  })
})
