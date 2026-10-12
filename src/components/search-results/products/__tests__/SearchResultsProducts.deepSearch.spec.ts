import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import type { QueryParams } from '@/types/search-results/QueryParams'
import type { SearchQueryResult } from '@getlupa/client-sdk/Types'
import SearchResultsProducts from '../SearchResultsProducts.vue'
import SearchResultsProductCard from '../product-card/SearchResultsProductCard.vue'

const options = {
  queryKey: 'qk',
  labels: {},
  elements: [],
  grid: { columns: { xl: 4, l: 3, md: 2, sm: 2, xs: 1 } },
  pagination: {},
  options: { environment: 'production' }
} as unknown as SearchResultsOptions

const mountProducts = (params: QueryParams, result: Partial<SearchQueryResult> = {}) => {
  const pinia = createTestingPinia({ stubActions: false })
  useParamsStore(pinia).params = params
  useSearchResultStore(pinia).searchResult = {
    total: 1,
    items: [{ id: '1' }],
    ...result
  } as SearchQueryResult
  const wrapper = shallowMount(SearchResultsProducts, {
    global: {
      plugins: [pinia],
      stubs: { LoadingGrid: { template: '<div><slot /></div>' } }
    },
    props: { options }
  })
  return wrapper.findComponent(SearchResultsProductCard)
}

describe('SearchResultsProducts deep search click metadata', () => {
  it('should add deepSearch metadata when deep search result is active', () => {
    const card = mountProducts({
      query: 'tv',
      adjusted: '',
      filters: { brand: ['LG'] }
    } as unknown as QueryParams)

    expect(card.props('analyticsMetadata')).toEqual({ deepSearch: true })
  })

  it('should combine deepSearch with did you mean metadata', () => {
    const card = mountProducts(
      { query: 'tv', adjusted: '', filters: { brand: ['LG'] } } as unknown as QueryParams,
      { suggestedSearchText: 'tvs' }
    )

    expect(card.props('analyticsMetadata')).toEqual({
      _lupaEventSource: 'didYouMean',
      _lupaUpdatedQuery: 'tvs',
      deepSearch: true
    })
  })

  it('should not add deepSearch metadata without adjusted search text', () => {
    const card = mountProducts({
      query: 'tv',
      filters: { brand: ['LG'] }
    } as unknown as QueryParams)

    expect(card.props('analyticsMetadata')).toBeUndefined()
  })

  it('should not add deepSearch metadata without filters', () => {
    const card = mountProducts({ query: 'tv', adjusted: '', filters: {} } as unknown as QueryParams)

    expect(card.props('analyticsMetadata')).toBeUndefined()
  })
})
