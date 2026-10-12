import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import { useAiSearchStore } from '@/stores/aiSearch'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import type { AiSearchOptions } from '@/types/search-results/AiSearchOptions'
import type { QueryParams } from '@/types/search-results/QueryParams'
import AiSearchPanel from '../AiSearchPanel.vue'

const activeParams = {
  query: 'tv',
  adjusted: '',
  filters: { brand: ['LG'] }
} as unknown as QueryParams

const mountPanel = ({
  aiSearch = { enabled: true },
  params = activeParams,
  explanation,
  precheckAssisted = false,
  loading = false
}: {
  aiSearch?: AiSearchOptions
  params?: QueryParams
  explanation?: string
  precheckAssisted?: boolean
  loading?: boolean
}) => {
  const pinia = createTestingPinia({
    stubActions: false,
    initialState: {
      aiSearch: {
        precheckAssisted,
        explanation,
        explanationSearchText: explanation ? 'tv' : undefined
      },
      searchResult: { loading }
    }
  })
  // Set options with the action: initialState would deep-merge into the shared DEFAULT_OPTIONS_RESULTS
  useOptionsStore(pinia).setSearchResultOptions({
    options: { aiSearch } as unknown as SearchResultsOptions
  })
  useParamsStore(pinia).params = params
  const wrapper = mount(AiSearchPanel, { global: { plugins: [pinia] } })
  return { wrapper, aiSearchStore: useAiSearchStore(pinia) }
}

describe('AiSearchPanel', () => {
  it('should show explanation and clear button when AI search result is active', () => {
    const { wrapper } = mountPanel({ explanation: 'Cheap LG TVs' })

    expect(wrapper.find('.lupa-ai-search-panel').exists()).toBe(true)
    expect(wrapper.find('.lupa-ai-search-panel-text').text()).toBe('Cheap LG TVs')
    expect(wrapper.find('.lupa-ai-search-panel-clear').text()).toBe('Show all results')
  })

  it('should show fallback text without explanation', () => {
    const { wrapper } = mountPanel({})

    expect(wrapper.find('.lupa-ai-search-panel-text').text()).toBe('Results refined by AI')
  })

  it('should show fallback text when explanation is disabled', () => {
    const { wrapper } = mountPanel({
      aiSearch: { enabled: true, regular: { showExplanation: false } },
      explanation: 'Cheap LG TVs'
    })

    expect(wrapper.find('.lupa-ai-search-panel-text').text()).toBe('Results refined by AI')
  })

  it('should use custom labels', () => {
    const { wrapper } = mountPanel({
      aiSearch: {
        enabled: true,
        regular: { labels: { explanationFallback: 'Patikslinta DI', clear: 'Rodyti visus' } }
      }
    })

    expect(wrapper.find('.lupa-ai-search-panel-text').text()).toBe('Patikslinta DI')
    expect(wrapper.find('.lupa-ai-search-panel-clear').text()).toBe('Rodyti visus')
  })

  it('should clear AI search on button click', async () => {
    const { wrapper, aiSearchStore } = mountPanel({})
    const clearAiSearch = vi.spyOn(aiSearchStore, 'clearAiSearch').mockImplementation(() => {})

    await wrapper.find('.lupa-ai-search-panel-clear').trigger('click')

    expect(clearAiSearch).toHaveBeenCalled()
  })

  it('should not show panel without filters', () => {
    const { wrapper } = mountPanel({
      params: { query: 'tv', adjusted: '', filters: {} } as unknown as QueryParams
    })

    expect(wrapper.find('.lupa-ai-search-panel').exists()).toBe(false)
  })

  it('should not show panel without adjusted search text', () => {
    const { wrapper } = mountPanel({
      params: { query: 'tv', filters: { brand: ['LG'] } } as unknown as QueryParams
    })

    expect(wrapper.find('.lupa-ai-search-panel').exists()).toBe(false)
  })

  it('should not show panel while AI search is loading', () => {
    const { wrapper } = mountPanel({ precheckAssisted: true, loading: true })

    expect(wrapper.find('.lupa-ai-search-panel').exists()).toBe(false)
  })

  it('should not show panel when AI search is disabled or not in regular mode', () => {
    expect(
      mountPanel({ aiSearch: { enabled: false } })
        .wrapper.find('.lupa-ai-search-panel')
        .exists()
    ).toBe(false)
    expect(
      mountPanel({ aiSearch: { enabled: true, mode: 'bestProducts' } })
        .wrapper.find('.lupa-ai-search-panel')
        .exists()
    ).toBe(false)
  })
})
