import { createPinia, setActivePinia } from 'pinia'
import { useParamsStore } from '../params'

describe('params store replaceParams', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.history.replaceState({}, '', '/search?q=tv&p=2')
  })

  it('should replace URL and params without adding a history entry', () => {
    const store = useParamsStore()
    const historyLength = window.history.length

    store.replaceParams({ params: [{ name: 'f.brand', value: ['LG'] }], paramsToRemove: ['p'] })

    expect(window.location.search).toBe('?q=tv&f.brand=LG')
    expect(window.history.length).toBe(historyLength)
    expect(store.params).toEqual({ query: 'tv', filters: { brand: ['LG'] } })
  })

  it('should keep empty param values', () => {
    const store = useParamsStore()

    store.replaceParams({ params: [{ name: 'adj', value: '' }] })

    expect(window.location.search).toBe('?q=tv&p=2&adj=')
    expect(store.adjustedSearchText).toBe('')
  })

  it('should mark the new search string as silent once', () => {
    const store = useParamsStore()

    store.replaceParams({ params: [{ name: 'adj', value: '' }] })

    expect(store.searchString).toBe('?q=tv&p=2&adj=')
    expect(store.consumeSilentSearchString(store.searchString)).toBe(true)
    expect(store.consumeSilentSearchString(store.searchString)).toBe(false)
  })

  it('should not mark other search strings as silent', () => {
    const store = useParamsStore()

    store.replaceParams({ params: [{ name: 'adj', value: '' }] })

    expect(store.consumeSilentSearchString('?q=other')).toBe(false)
    expect(store.consumeSilentSearchString('?q=tv&p=2&adj=')).toBe(false)
  })
})
