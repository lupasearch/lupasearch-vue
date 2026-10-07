import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useOptionsStore } from '@/stores/options'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import AiSearchLoadingPanel from '../AiSearchLoadingPanel.vue'
import type { AiSearchOptions } from '@/types/search-results/AiSearchOptions'

const mountPanel = ({
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
  return mount(AiSearchLoadingPanel, {
    global: {
      plugins: [pinia]
    }
  })
}

describe('AiSearchLoadingPanel', () => {
  it('should show panel with loading label when loader type is panel', () => {
    const wrapper = mountPanel({
      aiSearch: {
        enabled: true,
        regular: { loader: 'panel', labels: { loading: 'Ieškome su DI' } }
      }
    })

    expect(wrapper.find('.lupa-ai-search-loading-panel').exists()).toBe(true)
    expect(wrapper.find('.lupa-ai-search-loading-label').text()).toBe('Ieškome su DI')
  })

  it('should not show panel with default dialog loader type', () => {
    const wrapper = mountPanel({ aiSearch: { enabled: true } })

    expect(wrapper.find('.lupa-ai-search-loading-panel').exists()).toBe(false)
  })

  it('should not show panel when precheck is not assisted', () => {
    const wrapper = mountPanel({
      aiSearch: { enabled: true, regular: { loader: 'panel' } },
      precheckAssisted: false
    })

    expect(wrapper.find('.lupa-ai-search-loading-panel').exists()).toBe(false)
  })

  it('should not show panel when results are not loading', () => {
    const wrapper = mountPanel({
      aiSearch: { enabled: true, regular: { loader: 'panel' } },
      loading: false
    })

    expect(wrapper.find('.lupa-ai-search-loading-panel').exists()).toBe(false)
  })

  it('should not show panel outside regular mode', () => {
    const wrapper = mountPanel({
      aiSearch: { enabled: true, mode: 'bestProducts', regular: { loader: 'panel' } }
    })

    expect(wrapper.find('.lupa-ai-search-loading-panel').exists()).toBe(false)
  })
})
