import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useOptionsStore } from '@/stores/options'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import AiSearchLoadingDialog from '../AiSearchLoadingDialog.vue'
import type { AiSearchOptions } from '@/types/search-results/AiSearchOptions'

const mountDialog = ({
  aiSearch,
  precheckAssisted = true,
  loading = true
}: {
  aiSearch?: AiSearchOptions
  precheckAssisted?: boolean
  loading?: boolean
}) => {
  const pinia = createTestingPinia({
    stubActions: false,
    initialState: {
      aiSearch: { precheckAssisted },
      searchResult: { loading }
    }
  })
  // Set options with the action: initialState would deep-merge into the shared DEFAULT_OPTIONS_RESULTS
  useOptionsStore(pinia).setSearchResultOptions({
    options: { aiSearch } as unknown as SearchResultsOptions
  })
  return mount(AiSearchLoadingDialog, {
    global: {
      plugins: [pinia]
    }
  })
}

describe('AiSearchLoadingDialog', () => {
  it('should show dialog with default label when precheck is assisted and results are loading', () => {
    const wrapper = mountDialog({ aiSearch: { enabled: true, regular: { precheck: true } } })

    expect(wrapper.find('.lupa-ai-search-loading-overlay').exists()).toBe(true)
    expect(wrapper.find('[role="dialog"]').attributes('aria-label')).toBe('Searching with AI')
    expect(wrapper.find('.lupa-ai-search-loading-label').text()).toBe('Searching with AI')
  })

  it('should show custom loading label', () => {
    const wrapper = mountDialog({
      aiSearch: { enabled: true, regular: { labels: { loading: 'Ieškome su DI' } } }
    })

    expect(wrapper.find('.lupa-ai-search-loading-label').text()).toBe('Ieškome su DI')
  })

  it('should not show dialog when precheck is not assisted', () => {
    const wrapper = mountDialog({ aiSearch: { enabled: true }, precheckAssisted: false })

    expect(wrapper.find('.lupa-ai-search-loading-overlay').exists()).toBe(false)
  })

  it('should not show dialog when results are not loading', () => {
    const wrapper = mountDialog({ aiSearch: { enabled: true }, loading: false })

    expect(wrapper.find('.lupa-ai-search-loading-overlay').exists()).toBe(false)
  })

  it('should not show dialog when loader type is panel', () => {
    const wrapper = mountDialog({ aiSearch: { enabled: true, regular: { loader: 'panel' } } })

    expect(wrapper.find('.lupa-ai-search-loading-overlay').exists()).toBe(false)
  })

  it('should not show dialog when AI search is disabled or not in regular mode', () => {
    expect(
      mountDialog({ aiSearch: { enabled: false } })
        .find('.lupa-ai-search-loading-overlay')
        .exists()
    ).toBe(false)
    expect(
      mountDialog({ aiSearch: { enabled: true, mode: 'bestProducts' } })
        .find('.lupa-ai-search-loading-overlay')
        .exists()
    ).toBe(false)
  })
})
