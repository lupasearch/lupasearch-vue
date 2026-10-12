import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import lupaSearchSdk from '@getlupa/client-sdk'
import { useDeepSearchStore } from '../deepSearch'
import { useSearchResultStore } from '../searchResult'
import { useParamsStore } from '../params'
import { parseParams } from '@/utils/params.utils'
import type { PublicQuery, SearchQueryResult } from '@getlupa/client-sdk/Types'
import { useOptionsStore } from '../options'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'

vi.mock('@getlupa/client-sdk', () => ({
  default: { queryPrecheck: vi.fn() }
}))

const queryPrecheck = vi.mocked(lupaSearchSdk.queryPrecheck)

const deferred = <T>() => {
  let resolve: (value: T) => void = () => {}
  const promise = new Promise<T>((res) => (resolve = res))
  return { promise, resolve }
}

describe('deepSearch store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    queryPrecheck.mockReset()
  })

  it('should set assisted from precheck response with the same query body', async () => {
    queryPrecheck.mockResolvedValue({ success: true, assisted: true })
    const store = useDeepSearchStore()
    const query = { searchText: 'cheapest samsung fridge', limit: 12 }

    await store.precheck({ requestId: '1', queryKey: 'qk', query })

    expect(queryPrecheck).toHaveBeenCalledWith('qk', query, undefined)
    expect(store.precheckAssisted).toBe(true)
  })

  it('should show deep search loading only while results are loading', async () => {
    queryPrecheck.mockResolvedValue({ success: true, assisted: true })
    const store = useDeepSearchStore()
    const searchResultStore = useSearchResultStore()
    searchResultStore.setLoading(true)

    await store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: 'tv' } })
    expect(store.deepSearchLoading).toBe(true)

    searchResultStore.setLoading(false)
    expect(store.deepSearchLoading).toBe(false)
  })

  it('should skip precheck without search text', async () => {
    const store = useDeepSearchStore()

    await store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: '' } })

    expect(queryPrecheck).not.toHaveBeenCalled()
    expect(store.precheckAssisted).toBe(false)
  })

  it('should skip precheck when adjustedSearchText is sent', async () => {
    const store = useDeepSearchStore()

    await store.precheck({
      requestId: '1',
      queryKey: 'qk',
      query: { searchText: 'tv', adjustedSearchText: '' }
    })

    expect(queryPrecheck).not.toHaveBeenCalled()
  })

  it('should ignore stale precheck responses', async () => {
    const first = deferred<{ success: true; assisted: boolean }>()
    queryPrecheck
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce({ success: true, assisted: false })
    const store = useDeepSearchStore()

    const firstCall = store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: 'a' } })
    await store.precheck({ requestId: '2', queryKey: 'qk', query: { searchText: 'b' } })
    first.resolve({ success: true, assisted: true })
    await firstCall

    expect(store.precheckAssisted).toBe(false)
  })

  it('should not be assisted on precheck error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    queryPrecheck.mockRejectedValue(new Error('network'))
    const store = useDeepSearchStore()

    await store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: 'tv' } })

    expect(store.precheckAssisted).toBe(false)
  })

  it('should not be assisted on unsuccessful precheck response', async () => {
    queryPrecheck.mockResolvedValue({ success: false, errors: { message: 'error' } })
    const store = useDeepSearchStore()

    await store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: 'tv' } })

    expect(store.precheckAssisted).toBe(false)
  })

  it('should reset precheck state', async () => {
    queryPrecheck.mockResolvedValue({ success: true, assisted: true })
    const store = useDeepSearchStore()
    await store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: 'tv' } })

    store.resetPrecheck()

    expect(store.precheckAssisted).toBe(false)
  })
})

describe('deepSearch store saveDeepSearchResultToUrl', () => {
  const sortOptions = [
    { key: 'relevance', label: 'Relevance', config: [{ _relevance: 'desc' as const }] },
    { key: 'cheapest', label: 'Cheapest', config: [{ price: 'asc' as const }] }
  ]

  const aiResult = (deepSearch?: Record<string, unknown>) =>
    ({
      success: true,
      searchText: 'pigiausias samsung šaldytuvas',
      items: [],
      executionMetadata: deepSearch ? { deepSearch } : undefined
    }) as unknown as SearchQueryResult

  const setUrl = (search: string) => {
    window.history.replaceState({}, '', `/search${search}`)
    const paramsStore = useParamsStore()
    paramsStore.add(parseParams(undefined, new URLSearchParams(search)))
    return paramsStore
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should store deep search filters, sort and adjusted search text in the URL without a new search', () => {
    const paramsStore = setUrl('?q=pigiausias+samsung+%C5%A1aldytuvas')
    const store = useDeepSearchStore()

    store.saveDeepSearchResultToUrl({
      query: { searchText: 'pigiausias samsung šaldytuvas' },
      result: aiResult({
        applied: true,
        filters: { categories: ['Šaldytuvai'], brand: ['Samsung'] },
        sort: [{ in_stock: 'desc' }, { price: 'asc' }],
        searchText: '',
        explanation: 'Cheapest Samsung fridges.'
      }),
      sortOptions
    })

    const params = new URLSearchParams(window.location.search)
    expect(params.get('adj')).toBe('')
    expect(params.getAll('f.categories')).toEqual(['Šaldytuvai'])
    expect(params.getAll('f.brand')).toEqual(['Samsung'])
    expect(params.get('s')).toBe('in_stock:desc,price:asc')
    expect(paramsStore.adjustedSearchText).toBe('')
    expect(paramsStore.filters).toEqual({ categories: ['Šaldytuvai'], brand: ['Samsung'] })
    expect(paramsStore.consumeSilentSearchString(paramsStore.searchString)).toBe(true)
    expect(store.explanation).toBe('Cheapest Samsung fridges.')
  })

  it('should use configured sort key when deep search sort matches it', () => {
    setUrl('?q=cheap')
    const store = useDeepSearchStore()

    store.saveDeepSearchResultToUrl({
      query: { searchText: 'cheap' },
      result: aiResult({ applied: true, sort: [{ price: 'asc' }], searchText: 'tv' }),
      sortOptions
    })

    const params = new URLSearchParams(window.location.search)
    expect(params.get('s')).toBe('cheapest')
    expect(params.get('adj')).toBe('tv')
  })

  it('should keep current sort when deep search did not change it', () => {
    setUrl('?q=cheap&s=relevance')
    const store = useDeepSearchStore()

    store.saveDeepSearchResultToUrl({
      query: { searchText: 'cheap' },
      result: aiResult({ applied: true, filters: { brand: ['LG'] }, searchText: '' }),
      sortOptions
    })

    expect(new URLSearchParams(window.location.search).get('s')).toBe('relevance')
  })

  it('should not change the URL when deep search was not applied', () => {
    setUrl('?q=tv')
    const store = useDeepSearchStore()

    store.saveDeepSearchResultToUrl({
      query: { searchText: 'tv' },
      result: aiResult({ applied: false, filters: { brand: ['LG'] } }),
      sortOptions
    })

    expect(window.location.search).toBe('?q=tv')
    expect(store.explanation).toBeUndefined()
  })

  it('should not change the URL when adjusted search text was sent', () => {
    setUrl('?q=tv&adj=')
    const store = useDeepSearchStore()

    store.saveDeepSearchResultToUrl({
      query: { searchText: 'tv', adjustedSearchText: '' },
      result: aiResult({ applied: true, filters: { brand: ['LG'] }, searchText: '' }),
      sortOptions
    })

    expect(window.location.search).toBe('?q=tv&adj=')
  })
})

describe('deepSearch store active deep search state', () => {
  const setUrl = (search: string) => {
    window.history.replaceState({}, '', `/search${search}`)
    const paramsStore = useParamsStore()
    paramsStore.add(parseParams(undefined, new URLSearchParams(search)))
    return paramsStore
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should be active with adjusted search text and at least one filter', () => {
    setUrl('?q=tv&adj=&f.brand=LG')

    expect(useDeepSearchStore().deepSearchActive).toBe(true)
  })

  it('should be active with range or hierarchy filters', () => {
    setUrl('?q=tv&adj=&fr.price=10:20')
    expect(useDeepSearchStore().deepSearchActive).toBe(true)

    setActivePinia(createPinia())
    setUrl('?q=tv&adj=&fh.category=TV')
    expect(useDeepSearchStore().deepSearchActive).toBe(true)
  })

  it('should not be active without filters', () => {
    setUrl('?q=tv&adj=&s=price:asc')

    expect(useDeepSearchStore().deepSearchActive).toBe(false)
  })

  it('should not be active without adjusted search text', () => {
    setUrl('?q=tv&f.brand=LG')

    expect(useDeepSearchStore().deepSearchActive).toBe(false)
  })

  it('should only return explanation for the search text it was received for', () => {
    setUrl('?q=cheap+tv')
    const store = useDeepSearchStore()
    store.saveDeepSearchResultToUrl({
      query: { searchText: 'cheap tv' },
      result: {
        success: true,
        executionMetadata: {
          deepSearch: { applied: true, filters: { brand: ['LG'] }, explanation: 'Cheap TVs' }
        }
      } as unknown as SearchQueryResult
    })
    expect(store.currentExplanation).toBe('Cheap TVs')

    setUrl('?q=other&adj=&f.brand=LG')
    expect(store.currentExplanation).toBeUndefined()
  })

  it('should clear filters, sort and page but keep adjusted search text', () => {
    const paramsStore = setUrl('?q=tv&adj=&f.brand=LG&fr.price=10:20&s=price:asc&p=2&l=24')
    const store = useDeepSearchStore()

    store.clearDeepSearch()

    expect(window.location.search).toBe('?q=tv&adj=&l=24')
    expect(paramsStore.adjustedSearchText).toBe('')
    expect(paramsStore.filters).toEqual({})
    expect(store.deepSearchActive).toBe(false)
  })
})

describe('deepSearch store best products', () => {
  const query = vi.fn()

  const request = (searchText: string, autoLoad = true) => ({
    queryKey: 'qk',
    query: { searchText, limit: 3, modifiers: { deepSearch: true } } as PublicQuery,
    autoLoad
  })

  const bestProductsResult = (deepSearch?: Record<string, unknown>) =>
    ({
      success: true,
      items: [{ id: '1' }, { id: '2' }],
      executionMetadata: deepSearch ? { deepSearch } : undefined
    }) as unknown as SearchQueryResult

  beforeEach(() => {
    setActivePinia(createPinia())
    ;(lupaSearchSdk as unknown as { query: typeof query }).query = query
    query.mockReset()
  })

  it('should load best products when auto load is enabled', async () => {
    query.mockResolvedValue(bestProductsResult())
    const store = useDeepSearchStore()

    store.prepareBestProducts(request('cheap tv'))
    expect(store.bestProductsLoading).toBe(true)
    await vi.waitFor(() => expect(store.bestProductsLoading).toBe(false))

    expect(query).toHaveBeenCalledWith(
      'qk',
      { searchText: 'cheap tv', limit: 3, modifiers: { deepSearch: true } },
      undefined
    )
    expect(store.bestProductsResult?.items).toHaveLength(2)
  })

  it('should not reload best products for the same search text', async () => {
    query.mockResolvedValue(bestProductsResult())
    const store = useDeepSearchStore()

    store.prepareBestProducts(request('cheap tv'))
    await vi.waitFor(() => expect(store.bestProductsLoading).toBe(false))
    store.prepareBestProducts(request('cheap tv'))

    expect(query).toHaveBeenCalledTimes(1)
  })

  it('should reload best products when search text changes', async () => {
    query.mockResolvedValue(bestProductsResult())
    const store = useDeepSearchStore()

    store.prepareBestProducts(request('cheap tv'))
    await vi.waitFor(() => expect(store.bestProductsLoading).toBe(false))
    store.prepareBestProducts(request('oled tv'))
    await vi.waitFor(() => expect(store.bestProductsLoading).toBe(false))

    expect(query).toHaveBeenCalledTimes(2)
  })

  it('should wait for loadBestProducts when auto load is disabled', async () => {
    query.mockResolvedValue(bestProductsResult())
    const store = useDeepSearchStore()

    store.prepareBestProducts(request('cheap tv', false))
    expect(query).not.toHaveBeenCalled()
    expect(store.bestProductsRequest).not.toBeNull()

    await store.loadBestProducts()
    await store.loadBestProducts()

    expect(query).toHaveBeenCalledTimes(1)
    expect(store.bestProductsResult).not.toBeNull()
  })

  it('should reset best products without search text', () => {
    const store = useDeepSearchStore()

    store.prepareBestProducts(request('', true))

    expect(query).not.toHaveBeenCalled()
    expect(store.bestProductsRequest).toBeNull()
  })

  it('should ignore best products response for a previous search text', async () => {
    let resolveFirst: (value: SearchQueryResult) => void = () => {}
    query
      .mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)))
      .mockResolvedValueOnce(bestProductsResult({ applied: true, explanation: 'second' }))
    const store = useDeepSearchStore()

    store.prepareBestProducts(request('first'))
    store.prepareBestProducts(request('second'))
    await vi.waitFor(() => expect(store.bestProductsLoading).toBe(false))
    resolveFirst(bestProductsResult({ applied: true, explanation: 'first' }))
    await Promise.resolve()

    expect(store.bestProductsDeepSearch?.explanation).toBe('second')
  })

  it('should pass unsuccessful responses to onError', async () => {
    const onError = vi.fn()
    const error = { success: false, errors: { message: 'error' } }
    query.mockResolvedValue(error)
    const store = useDeepSearchStore()

    store.prepareBestProducts({ ...request('tv'), options: { environment: 'production', onError } })
    await vi.waitFor(() => expect(store.bestProductsLoading).toBe(false))

    expect(onError).toHaveBeenCalledWith(error)
    expect(store.bestProductsResult).toBeNull()
  })

  it('should expose deep search metadata only when applied', async () => {
    query.mockResolvedValue(bestProductsResult({ applied: false, filters: { brand: ['LG'] } }))
    const store = useDeepSearchStore()

    store.prepareBestProducts(request('tv'))
    await vi.waitFor(() => expect(store.bestProductsLoading).toBe(false))

    expect(store.bestProductsDeepSearch).toBeUndefined()
    expect(store.bestProductsHasSuggestions).toBe(false)
  })

  it('should apply suggested filters and sort as regular params', async () => {
    window.history.replaceState({}, '', '/search?q=cheap+samsung&p=2&f.brand=LG')
    const paramsStore = useParamsStore()
    paramsStore.add(parseParams(undefined, new URLSearchParams(window.location.search)))
    query.mockResolvedValue(
      bestProductsResult({
        applied: true,
        filters: { brand: ['Samsung'] },
        sort: [{ price: 'asc' }]
      })
    )
    const store = useDeepSearchStore()
    store.prepareBestProducts(request('cheap samsung'))
    await vi.waitFor(() => expect(store.bestProductsLoading).toBe(false))
    expect(store.bestProductsSuggestionsApplied).toBe(false)

    store.applyBestProductsSuggestions()

    const params = new URLSearchParams(window.location.search)
    expect(params.getAll('f.brand')).toEqual(['LG', 'Samsung'])
    expect(params.get('s')).toBe('price:asc')
    expect(params.has('p')).toBe(false)
    expect(params.has('adj')).toBe(false)
    expect(store.bestProductsSuggestionsApplied).toBe(true)
  })

  describe('applying suggested search text', () => {
    const setUrl = (search: string) => {
      window.history.replaceState({}, '', `/search${search}`)
      useParamsStore().add(parseParams(undefined, new URLSearchParams(search)))
    }

    const loadAppliedResult = async (deepSearchText?: string) => {
      query.mockResolvedValue(
        bestProductsResult({
          applied: true,
          filters: { brand: ['Samsung'] },
          searchText: deepSearchText
        })
      )
      const store = useDeepSearchStore()
      store.prepareBestProducts(request('cheapest samsung fridge'))
      await vi.waitFor(() => expect(store.bestProductsLoading).toBe(false))
      return store
    }

    it('should change search text to deep search text', async () => {
      setUrl('?q=cheapest+samsung+fridge')
      const store = await loadAppliedResult('fridge')

      store.applyBestProductsSuggestions()

      const params = new URLSearchParams(window.location.search)
      expect(params.get('q')).toBe('fridge')
      expect(params.getAll('f.brand')).toEqual(['Samsung'])
      expect(store.bestProductsSuggestionsApplied).toBe(true)
    })

    it('should keep best products for the applied search text', async () => {
      setUrl('?q=cheapest+samsung+fridge')
      const store = await loadAppliedResult('fridge')
      store.applyBestProductsSuggestions()

      store.prepareBestProducts(request('fridge'))

      expect(query).toHaveBeenCalledTimes(1)
      expect(store.bestProductsResult).not.toBeNull()
    })

    it('should reload best products for a new search text after applying', async () => {
      setUrl('?q=cheapest+samsung+fridge')
      const store = await loadAppliedResult('fridge')
      store.applyBestProductsSuggestions()

      store.prepareBestProducts(request('washing machine'))
      await vi.waitFor(() => expect(store.bestProductsLoading).toBe(false))

      expect(query).toHaveBeenCalledTimes(2)
    })

    it('should apply empty deep search text and keep best products for it', async () => {
      setUrl('?q=cheapest+samsung+fridge')
      const store = await loadAppliedResult('')
      store.applyBestProductsSuggestions()

      expect(new URLSearchParams(window.location.search).get('q')).toBe('')
      store.prepareBestProducts(request(''))
      expect(store.bestProductsRequest).not.toBeNull()
      expect(store.bestProductsResult).not.toBeNull()
    })

    it('should keep search text when deep search text is empty and empty queries are not allowed', async () => {
      useOptionsStore().setSearchResultOptions({
        options: { disallowEmptyQuery: true } as unknown as SearchResultsOptions
      })
      setUrl('?q=cheapest+samsung+fridge')
      const store = await loadAppliedResult('')

      store.applyBestProductsSuggestions()

      expect(new URLSearchParams(window.location.search).get('q')).toBe('cheapest samsung fridge')
      expect(store.bestProductsSuggestionsApplied).toBe(true)
    })

    it('should keep search text when deep search returned no search text', async () => {
      setUrl('?q=cheapest+samsung+fridge')
      const store = await loadAppliedResult(undefined)

      store.applyBestProductsSuggestions()

      expect(new URLSearchParams(window.location.search).get('q')).toBe('cheapest samsung fridge')
    })

    it('should collapse products when suggestions are applied', async () => {
      setUrl('?q=cheapest+samsung+fridge')
      const store = await loadAppliedResult('fridge')
      expect(store.bestProductsExpanded).toBe(true)

      store.applyBestProductsSuggestions()

      expect(store.bestProductsExpanded).toBe(false)
      store.prepareBestProducts(request('fridge'))
      expect(store.bestProductsExpanded).toBe(false)
    })

    it('should expand products again for a new search text', async () => {
      setUrl('?q=cheapest+samsung+fridge')
      const store = await loadAppliedResult('fridge')
      store.applyBestProductsSuggestions()

      store.prepareBestProducts(request('washing machine'))

      expect(store.bestProductsExpanded).toBe(true)
    })

    it('should toggle products', () => {
      const store = useDeepSearchStore()

      store.toggleBestProductsExpanded()
      expect(store.bestProductsExpanded).toBe(false)
      store.toggleBestProductsExpanded()
      expect(store.bestProductsExpanded).toBe(true)
      store.toggleBestProductsExpanded(false)
      expect(store.bestProductsExpanded).toBe(false)
    })

    it('should not be applied until search text matches', async () => {
      setUrl('?q=cheapest+samsung+fridge&f.brand=Samsung')
      const store = await loadAppliedResult('fridge')

      expect(store.bestProductsSuggestionsApplied).toBe(false)
    })
  })
})
