import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import lupaSearchSdk from '@getlupa/client-sdk'
import { useAiSearchStore } from '../aiSearch'
import { useSearchResultStore } from '../searchResult'
import { useParamsStore } from '../params'
import { parseParams } from '@/utils/params.utils'
import type { SearchQueryResult } from '@getlupa/client-sdk/Types'

vi.mock('@getlupa/client-sdk', () => ({
  default: { queryPrecheck: vi.fn() }
}))

const queryPrecheck = vi.mocked(lupaSearchSdk.queryPrecheck)

const deferred = <T>() => {
  let resolve: (value: T) => void = () => {}
  const promise = new Promise<T>((res) => (resolve = res))
  return { promise, resolve }
}

describe('aiSearch store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    queryPrecheck.mockReset()
  })

  it('should set assisted from precheck response with the same query body', async () => {
    queryPrecheck.mockResolvedValue({ success: true, assisted: true })
    const store = useAiSearchStore()
    const query = { searchText: 'cheapest samsung fridge', limit: 12 }

    await store.precheck({ requestId: '1', queryKey: 'qk', query })

    expect(queryPrecheck).toHaveBeenCalledWith('qk', query, undefined)
    expect(store.precheckAssisted).toBe(true)
  })

  it('should show AI loading only while results are loading', async () => {
    queryPrecheck.mockResolvedValue({ success: true, assisted: true })
    const store = useAiSearchStore()
    const searchResultStore = useSearchResultStore()
    searchResultStore.setLoading(true)

    await store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: 'tv' } })
    expect(store.aiSearchLoading).toBe(true)

    searchResultStore.setLoading(false)
    expect(store.aiSearchLoading).toBe(false)
  })

  it('should skip precheck without search text', async () => {
    const store = useAiSearchStore()

    await store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: '' } })

    expect(queryPrecheck).not.toHaveBeenCalled()
    expect(store.precheckAssisted).toBe(false)
  })

  it('should skip precheck when adjustedSearchText is sent', async () => {
    const store = useAiSearchStore()

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
    const store = useAiSearchStore()

    const firstCall = store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: 'a' } })
    await store.precheck({ requestId: '2', queryKey: 'qk', query: { searchText: 'b' } })
    first.resolve({ success: true, assisted: true })
    await firstCall

    expect(store.precheckAssisted).toBe(false)
  })

  it('should not be assisted on precheck error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    queryPrecheck.mockRejectedValue(new Error('network'))
    const store = useAiSearchStore()

    await store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: 'tv' } })

    expect(store.precheckAssisted).toBe(false)
  })

  it('should not be assisted on unsuccessful precheck response', async () => {
    queryPrecheck.mockResolvedValue({ success: false, errors: { message: 'error' } })
    const store = useAiSearchStore()

    await store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: 'tv' } })

    expect(store.precheckAssisted).toBe(false)
  })

  it('should reset precheck state', async () => {
    queryPrecheck.mockResolvedValue({ success: true, assisted: true })
    const store = useAiSearchStore()
    await store.precheck({ requestId: '1', queryKey: 'qk', query: { searchText: 'tv' } })

    store.resetPrecheck()

    expect(store.precheckAssisted).toBe(false)
  })
})

describe('aiSearch store applyAiSearchResult', () => {
  const sortOptions = [
    { key: 'relevance', label: 'Relevance', config: [{ _relevance: 'desc' as const }] },
    { key: 'cheapest', label: 'Cheapest', config: [{ price: 'asc' as const }] }
  ]

  const aiResult = (aiSearch?: Record<string, unknown>) =>
    ({
      success: true,
      searchText: 'pigiausias samsung šaldytuvas',
      items: [],
      executionMetadata: aiSearch ? { aiSearch } : undefined
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

  it('should store AI filters, sort and adjusted search text in the URL without a new search', () => {
    const paramsStore = setUrl('?q=pigiausias+samsung+%C5%A1aldytuvas')
    const store = useAiSearchStore()

    store.applyAiSearchResult({
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

  it('should use configured sort key when AI sort matches it', () => {
    setUrl('?q=cheap')
    const store = useAiSearchStore()

    store.applyAiSearchResult({
      query: { searchText: 'cheap' },
      result: aiResult({ applied: true, sort: [{ price: 'asc' }], searchText: 'tv' }),
      sortOptions
    })

    const params = new URLSearchParams(window.location.search)
    expect(params.get('s')).toBe('cheapest')
    expect(params.get('adj')).toBe('tv')
  })

  it('should keep current sort when AI search did not change it', () => {
    setUrl('?q=cheap&s=relevance')
    const store = useAiSearchStore()

    store.applyAiSearchResult({
      query: { searchText: 'cheap' },
      result: aiResult({ applied: true, filters: { brand: ['LG'] }, searchText: '' }),
      sortOptions
    })

    expect(new URLSearchParams(window.location.search).get('s')).toBe('relevance')
  })

  it('should not change the URL when AI search was not applied', () => {
    setUrl('?q=tv')
    const store = useAiSearchStore()

    store.applyAiSearchResult({
      query: { searchText: 'tv' },
      result: aiResult({ applied: false, filters: { brand: ['LG'] } }),
      sortOptions
    })

    expect(window.location.search).toBe('?q=tv')
    expect(store.explanation).toBeUndefined()
  })

  it('should not change the URL when adjusted search text was sent', () => {
    setUrl('?q=tv&adj=')
    const store = useAiSearchStore()

    store.applyAiSearchResult({
      query: { searchText: 'tv', adjustedSearchText: '' },
      result: aiResult({ applied: true, filters: { brand: ['LG'] }, searchText: '' }),
      sortOptions
    })

    expect(window.location.search).toBe('?q=tv&adj=')
  })
})

describe('aiSearch store active AI search state', () => {
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

    expect(useAiSearchStore().aiSearchActive).toBe(true)
  })

  it('should be active with range or hierarchy filters', () => {
    setUrl('?q=tv&adj=&fr.price=10:20')
    expect(useAiSearchStore().aiSearchActive).toBe(true)

    setActivePinia(createPinia())
    setUrl('?q=tv&adj=&fh.category=TV')
    expect(useAiSearchStore().aiSearchActive).toBe(true)
  })

  it('should not be active without filters', () => {
    setUrl('?q=tv&adj=&s=price:asc')

    expect(useAiSearchStore().aiSearchActive).toBe(false)
  })

  it('should not be active without adjusted search text', () => {
    setUrl('?q=tv&f.brand=LG')

    expect(useAiSearchStore().aiSearchActive).toBe(false)
  })

  it('should only return explanation for the search text it was received for', () => {
    setUrl('?q=cheap+tv')
    const store = useAiSearchStore()
    store.applyAiSearchResult({
      query: { searchText: 'cheap tv' },
      result: {
        success: true,
        executionMetadata: {
          aiSearch: { applied: true, filters: { brand: ['LG'] }, explanation: 'Cheap TVs' }
        }
      } as unknown as SearchQueryResult
    })
    expect(store.currentExplanation).toBe('Cheap TVs')

    setUrl('?q=other&adj=&f.brand=LG')
    expect(store.currentExplanation).toBeUndefined()
  })

  it('should clear filters, sort and page but keep adjusted search text', () => {
    const paramsStore = setUrl('?q=tv&adj=&f.brand=LG&fr.price=10:20&s=price:asc&p=2&l=24')
    const store = useAiSearchStore()

    store.clearAiSearch()

    expect(window.location.search).toBe('?q=tv&adj=&l=24')
    expect(paramsStore.adjustedSearchText).toBe('')
    expect(paramsStore.filters).toEqual({})
    expect(store.aiSearchActive).toBe(false)
  })
})
