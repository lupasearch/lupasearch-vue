import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import { useAiSearchStore } from '@/stores/aiSearch'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import type { SearchResultsProductCardOptions } from '@/types/search-results/SearchResultsProductCardOptions'
import type { AiSearchOptions } from '@/types/search-results/AiSearchOptions'
import type { QueryParams } from '@/types/search-results/QueryParams'
import type { SearchQueryResult } from '@getlupa/client-sdk/Types'
import AiSearchBestProducts from '../AiSearchBestProducts.vue'
import SearchResultsProductCard from '../../products/product-card/SearchResultsProductCard.vue'

const productCardOptions = {
  queryKey: 'main',
  elements: [],
  labels: {}
} as unknown as SearchResultsProductCardOptions

const result = (aiSearch?: Record<string, unknown>) =>
  ({
    success: true,
    items: [{ id: '1' }, { id: '2' }, { id: '3' }],
    executionMetadata: aiSearch ? { aiSearch } : undefined
  }) as unknown as SearchQueryResult

const appliedAiSearch = {
  applied: true,
  filters: { brand: ['Samsung'] },
  sort: [{ price: 'asc' }],
  explanation: 'Cheapest Samsung fridges'
}

const mountBestProducts = ({
  aiSearch = { enabled: true, mode: 'bestProducts' },
  bestProductsResult = null,
  bestProductsLoading = false,
  bestProductsExpanded = true,
  hasRequest = true,
  params = { query: 'cheap samsung' } as QueryParams,
  sort = [{ key: 'cheapest', label: 'Cheapest', config: [{ price: 'asc' }] }]
}: {
  aiSearch?: AiSearchOptions
  bestProductsResult?: SearchQueryResult | null
  bestProductsLoading?: boolean
  bestProductsExpanded?: boolean
  hasRequest?: boolean
  params?: QueryParams
  sort?: unknown[]
}) => {
  const pinia = createTestingPinia({
    stubActions: false,
    initialState: {
      aiSearch: {
        bestProductsRequest: hasRequest
          ? { queryKey: 'main', query: { searchText: 'cheap samsung' } }
          : null,
        bestProductsResult,
        bestProductsLoading,
        bestProductsExpanded
      },
      searchResult: { columnCount: 4 }
    }
  })
  // Set options with the action: initialState would deep-merge into the shared DEFAULT_OPTIONS_RESULTS
  useOptionsStore(pinia).setSearchResultOptions({
    options: { aiSearch, sort, labels: { sortBy: 'Sort by:' } } as unknown as SearchResultsOptions
  })
  useParamsStore(pinia).params = params
  const wrapper = mount(AiSearchBestProducts, {
    global: { plugins: [pinia], stubs: { SearchResultsProductCard: true } },
    props: { productCardOptions }
  })
  return { wrapper, aiSearchStore: useAiSearchStore(pinia) }
}

describe('AiSearchBestProducts', () => {
  it('should show title, explanation, suggestions and products', () => {
    const { wrapper } = mountBestProducts({ bestProductsResult: result(appliedAiSearch) })

    expect(wrapper.find('.lupa-ai-search-best-products-title').text()).toBe(
      'Best matches for your search'
    )
    expect(wrapper.find('.lupa-ai-search-best-products-explanation').text()).toBe(
      'Cheapest Samsung fridges'
    )
    const suggestions = wrapper.findAll('.lupa-ai-search-best-products-suggestion')
    expect(suggestions.map((s) => s.text())).toEqual(['Brand: Samsung', 'Sort by: Cheapest'])
    expect(wrapper.find('.lupa-ai-search-best-products-apply').text()).toBe(
      'Apply suggested filters'
    )
    expect(wrapper.findAllComponents(SearchResultsProductCard)).toHaveLength(3)
  })

  it('should pass AI search click metadata and card options to product cards', () => {
    const { wrapper } = mountBestProducts({
      aiSearch: {
        enabled: true,
        mode: 'bestProducts',
        bestProducts: { queryKey: 'ai', productCard: { idKey: 'id' } }
      },
      bestProductsResult: result()
    })

    const card = wrapper.findComponent(SearchResultsProductCard)
    expect(card.props('analyticsMetadata')).toEqual({ aiSearch: true })
    expect(card.props('options')).toMatchObject({ queryKey: 'ai', idKey: 'id' })
    expect(card.attributes('style')).toContain('width: 33.3')
  })

  it('should show suggested sort label for sort without configured key', () => {
    const { wrapper } = mountBestProducts({
      bestProductsResult: result({ applied: true, sort: [{ rating: 'desc' }] })
    })

    expect(wrapper.find('.lupa-ai-search-best-products-suggestion-sort').text()).toBe(
      'Sort by: Suggested sort'
    )
  })

  it('should show loader while loading', () => {
    const { wrapper } = mountBestProducts({ bestProductsLoading: true })

    expect(wrapper.find('.lupa-ai-search-loading-label').text()).toBe('Finding best matches')
    expect(wrapper.find('.lupa-ai-search-best-products-items').exists()).toBe(false)
  })

  it('should show trigger in click to trigger mode before loading', async () => {
    const { wrapper, aiSearchStore } = mountBestProducts({
      aiSearch: { enabled: true, mode: 'clickToTrigger' }
    })
    const loadBestProducts = vi
      .spyOn(aiSearchStore, 'loadBestProducts')
      .mockImplementation(async () => {})

    const trigger = wrapper.find('.lupa-ai-search-best-products-trigger')
    expect(trigger.text()).toBe('Find best matches with AI')
    expect(wrapper.find('.lupa-ai-search-best-products-title').exists()).toBe(false)

    await trigger.trigger('click')
    expect(loadBestProducts).toHaveBeenCalled()
  })

  it('should not show trigger in best products mode', () => {
    const { wrapper } = mountBestProducts({})

    expect(wrapper.find('.lupa-ai-search-best-products').exists()).toBe(false)
  })

  it('should apply suggestions on button click', async () => {
    const { wrapper, aiSearchStore } = mountBestProducts({
      bestProductsResult: result(appliedAiSearch)
    })
    const apply = vi
      .spyOn(aiSearchStore, 'applyBestProductsSuggestions')
      .mockImplementation(() => {})

    await wrapper.find('.lupa-ai-search-best-products-apply').trigger('click')

    expect(apply).toHaveBeenCalled()
  })

  it('should hide apply button when suggestions are already applied', () => {
    const { wrapper } = mountBestProducts({
      bestProductsResult: result(appliedAiSearch),
      params: {
        query: 'cheap samsung',
        sort: 'cheapest',
        filters: { brand: ['Samsung'] }
      } as QueryParams
    })

    expect(wrapper.find('.lupa-ai-search-best-products-suggestions').exists()).toBe(true)
    expect(wrapper.find('.lupa-ai-search-best-products-apply').exists()).toBe(false)
  })

  it('should show only suggestions when products are hidden', () => {
    const { wrapper } = mountBestProducts({
      aiSearch: { enabled: true, mode: 'bestProducts', bestProducts: { showProducts: false } },
      bestProductsResult: result(appliedAiSearch)
    })

    expect(wrapper.find('.lupa-ai-search-best-products-suggestions').exists()).toBe(true)
    expect(wrapper.find('.lupa-ai-search-best-products-items').exists()).toBe(false)
  })

  it('should show products without suggestions when AI search was not applied', () => {
    const { wrapper } = mountBestProducts({ bestProductsResult: result({ applied: false }) })

    expect(wrapper.find('.lupa-ai-search-best-products-explanation').exists()).toBe(false)
    expect(wrapper.find('.lupa-ai-search-best-products-suggestions').exists()).toBe(false)
    expect(wrapper.findAllComponents(SearchResultsProductCard)).toHaveLength(3)
  })

  it('should hide panel when there is nothing to show', () => {
    const { wrapper } = mountBestProducts({
      bestProductsResult: { success: true, items: [] } as unknown as SearchQueryResult
    })

    expect(wrapper.find('.lupa-ai-search-best-products').exists()).toBe(false)
  })

  it('should hide panel without a best products request or outside best products modes', () => {
    expect(
      mountBestProducts({ hasRequest: false, bestProductsResult: result() })
        .wrapper.find('.lupa-ai-search-best-products')
        .exists()
    ).toBe(false)
    expect(
      mountBestProducts({ aiSearch: { enabled: true }, bestProductsResult: result() })
        .wrapper.find('.lupa-ai-search-best-products')
        .exists()
    ).toBe(false)
  })

  it('should show expanded products with a toggle to hide them', async () => {
    const { wrapper, aiSearchStore } = mountBestProducts({ bestProductsResult: result() })

    const toggle = wrapper.find('.lupa-ai-search-best-products-toggle')
    expect(toggle.text()).toBe('Hide products')
    expect(toggle.attributes('aria-expanded')).toBe('true')

    await toggle.trigger('click')

    expect(aiSearchStore.bestProductsExpanded).toBe(false)
    expect(wrapper.find('.lupa-ai-search-best-products-items').exists()).toBe(false)
    expect(toggle.text()).toBe('Show products')
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('should keep suggestions visible when products are collapsed', () => {
    const { wrapper } = mountBestProducts({
      bestProductsResult: result(appliedAiSearch),
      bestProductsExpanded: false
    })

    expect(wrapper.find('.lupa-ai-search-best-products-suggestions').exists()).toBe(true)
    expect(wrapper.find('.lupa-ai-search-best-products-explanation').exists()).toBe(true)
    expect(wrapper.find('.lupa-ai-search-best-products-items').exists()).toBe(false)
  })

  it('should not show toggle without products or while loading', () => {
    expect(
      mountBestProducts({
        aiSearch: { enabled: true, mode: 'bestProducts', bestProducts: { showProducts: false } },
        bestProductsResult: result(appliedAiSearch)
      })
        .wrapper.find('.lupa-ai-search-best-products-toggle')
        .exists()
    ).toBe(false)
    expect(
      mountBestProducts({ bestProductsLoading: true })
        .wrapper.find('.lupa-ai-search-best-products-toggle')
        .exists()
    ).toBe(false)
  })

  it('should use custom toggle labels', () => {
    const { wrapper } = mountBestProducts({
      aiSearch: {
        enabled: true,
        mode: 'bestProducts',
        bestProducts: { labels: { expandProducts: 'Rodyti', collapseProducts: 'Slėpti' } }
      },
      bestProductsResult: result(),
      bestProductsExpanded: false
    })

    expect(wrapper.find('.lupa-ai-search-best-products-toggle').text()).toBe('Rodyti')
  })
})
