import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useOptionsStore } from '@/stores/options'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import DeepSearchLoadingDialog from '../DeepSearchLoadingDialog.vue'
import type { DeepSearchOptions } from '@/types/search-results/DeepSearchOptions'

const mountDialog = ({
  deepSearch,
  precheckAssisted = true,
  loading = true
}: {
  deepSearch?: DeepSearchOptions
  precheckAssisted?: boolean
  loading?: boolean
}) => {
  const pinia = createTestingPinia({
    stubActions: false,
    initialState: {
      deepSearch: { precheckAssisted },
      searchResult: { loading }
    }
  })
  // Set options with the action: initialState would deep-merge into the shared DEFAULT_OPTIONS_RESULTS
  useOptionsStore(pinia).setSearchResultOptions({
    options: { deepSearch } as unknown as SearchResultsOptions
  })
  return mount(DeepSearchLoadingDialog, {
    global: {
      plugins: [pinia]
    }
  })
}

describe('DeepSearchLoadingDialog', () => {
  it('should show dialog with default label when precheck is assisted and results are loading', () => {
    const wrapper = mountDialog({ deepSearch: { enabled: true, regular: { precheck: true } } })

    expect(wrapper.find('.lupa-deep-search-loading-overlay').exists()).toBe(true)
    expect(wrapper.find('[role="dialog"]').attributes('aria-label')).toBe('Running deep search')
    expect(wrapper.find('.lupa-deep-search-loading-label').text()).toBe('Running deep search')
  })

  it('should show custom loading label', () => {
    const wrapper = mountDialog({
      deepSearch: { enabled: true, regular: { labels: { loading: 'Ieškome su DI' } } }
    })

    expect(wrapper.find('.lupa-deep-search-loading-label').text()).toBe('Ieškome su DI')
  })

  it('should not show dialog when precheck is not assisted', () => {
    const wrapper = mountDialog({ deepSearch: { enabled: true }, precheckAssisted: false })

    expect(wrapper.find('.lupa-deep-search-loading-overlay').exists()).toBe(false)
  })

  it('should not show dialog when results are not loading', () => {
    const wrapper = mountDialog({ deepSearch: { enabled: true }, loading: false })

    expect(wrapper.find('.lupa-deep-search-loading-overlay').exists()).toBe(false)
  })

  it('should not show dialog when loader type is panel', () => {
    const wrapper = mountDialog({ deepSearch: { enabled: true, regular: { loader: 'panel' } } })

    expect(wrapper.find('.lupa-deep-search-loading-overlay').exists()).toBe(false)
  })

  it('should not show dialog when deep search is disabled or not in regular mode', () => {
    expect(
      mountDialog({ deepSearch: { enabled: false } })
        .find('.lupa-deep-search-loading-overlay')
        .exists()
    ).toBe(false)
    expect(
      mountDialog({ deepSearch: { enabled: true, mode: 'bestProducts' } })
        .find('.lupa-deep-search-loading-overlay')
        .exists()
    ).toBe(false)
  })
})
