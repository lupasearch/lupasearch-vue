import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import { useDeepSearchStore } from '@/stores/deepSearch'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import type { DeepSearchOptions } from '@/types/search-results/DeepSearchOptions'
import type { QueryParams } from '@/types/search-results/QueryParams'
import DeepSearchPanel from '../DeepSearchPanel.vue'

const activeParams = {
  query: 'tv',
  adjusted: '',
  filters: { brand: ['LG'] }
} as unknown as QueryParams

const mountPanel = ({
  deepSearch = { enabled: true },
  params = activeParams,
  explanation,
  precheckAssisted = false,
  loading = false
}: {
  deepSearch?: DeepSearchOptions
  params?: QueryParams
  explanation?: string
  precheckAssisted?: boolean
  loading?: boolean
}) => {
  const pinia = createTestingPinia({
    stubActions: false,
    initialState: {
      deepSearch: {
        precheckAssisted,
        explanation,
        explanationSearchText: explanation ? 'tv' : undefined
      },
      searchResult: { loading }
    }
  })
  // Set options with the action: initialState would deep-merge into the shared DEFAULT_OPTIONS_RESULTS
  useOptionsStore(pinia).setSearchResultOptions({
    options: { deepSearch } as unknown as SearchResultsOptions
  })
  useParamsStore(pinia).params = params
  const wrapper = mount(DeepSearchPanel, { global: { plugins: [pinia] } })
  return { wrapper, deepSearchStore: useDeepSearchStore(pinia) }
}

describe('DeepSearchPanel', () => {
  it('should show explanation and clear button when deep search result is active', () => {
    const { wrapper } = mountPanel({ explanation: 'Cheap LG TVs' })

    expect(wrapper.find('.lupa-deep-search-panel').exists()).toBe(true)
    expect(wrapper.find('.lupa-deep-search-panel-text').text()).toBe('Cheap LG TVs')
    expect(wrapper.find('.lupa-deep-search-panel-clear').text()).toBe('Show all results')
  })

  it('should show fallback text without explanation', () => {
    const { wrapper } = mountPanel({})

    expect(wrapper.find('.lupa-deep-search-panel-text').text()).toBe(
      'Results refined by deep search'
    )
  })

  it('should show fallback text when explanation is disabled', () => {
    const { wrapper } = mountPanel({
      deepSearch: { enabled: true, regular: { showExplanation: false } },
      explanation: 'Cheap LG TVs'
    })

    expect(wrapper.find('.lupa-deep-search-panel-text').text()).toBe(
      'Results refined by deep search'
    )
  })

  it('should use custom labels', () => {
    const { wrapper } = mountPanel({
      deepSearch: {
        enabled: true,
        regular: { labels: { explanationFallback: 'Patikslinta DI', clear: 'Rodyti visus' } }
      }
    })

    expect(wrapper.find('.lupa-deep-search-panel-text').text()).toBe('Patikslinta DI')
    expect(wrapper.find('.lupa-deep-search-panel-clear').text()).toBe('Rodyti visus')
  })

  it('should clear deep search on button click', async () => {
    const { wrapper, deepSearchStore } = mountPanel({})
    const clearDeepSearch = vi
      .spyOn(deepSearchStore, 'clearDeepSearch')
      .mockImplementation(() => {})

    await wrapper.find('.lupa-deep-search-panel-clear').trigger('click')

    expect(clearDeepSearch).toHaveBeenCalled()
  })

  it('should not show panel without filters', () => {
    const { wrapper } = mountPanel({
      params: { query: 'tv', adjusted: '', filters: {} } as unknown as QueryParams
    })

    expect(wrapper.find('.lupa-deep-search-panel').exists()).toBe(false)
  })

  it('should not show panel without adjusted search text', () => {
    const { wrapper } = mountPanel({
      params: { query: 'tv', filters: { brand: ['LG'] } } as unknown as QueryParams
    })

    expect(wrapper.find('.lupa-deep-search-panel').exists()).toBe(false)
  })

  it('should not show panel while deep search is loading', () => {
    const { wrapper } = mountPanel({ precheckAssisted: true, loading: true })

    expect(wrapper.find('.lupa-deep-search-panel').exists()).toBe(false)
  })

  it('should not show panel when deep search is disabled or not in regular mode', () => {
    expect(
      mountPanel({ deepSearch: { enabled: false } })
        .wrapper.find('.lupa-deep-search-panel')
        .exists()
    ).toBe(false)
    expect(
      mountPanel({ deepSearch: { enabled: true, mode: 'bestProducts' } })
        .wrapper.find('.lupa-deep-search-panel')
        .exists()
    ).toBe(false)
  })
})
