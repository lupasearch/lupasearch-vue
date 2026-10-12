import { createPinia, setActivePinia } from 'pinia'
import { useSorting } from '../useSorting'
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'

const sort = [
  {
    key: 'relevance',
    label: 'Relevance',
    config: [{ _relevance: 'desc' as const }],
    default: true
  },
  { key: 'cheapest', label: 'Cheapest', config: [{ price: 'asc' as const }] }
]

const setup = (sortParam?: string, labels: Record<string, string> = {}) => {
  useOptionsStore().setSearchResultOptions({
    options: { sort, labels } as unknown as SearchResultsOptions
  })
  useParamsStore().add({ query: 'tv', ...(sortParam ? { sort: sortParam } : {}) })
  return useSorting()
}

describe('useSorting suggested sort', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should only list configured sorts when sort param matches a key', () => {
    const { sortItems } = setup('cheapest')

    expect(sortItems.value.map((x) => x.key)).toEqual(['relevance', 'cheapest'])
  })

  it('should add suggested sort for serialized sort param', () => {
    const { sortItems, setSortValue, selectedKey } = setup('in_stock:desc,price:asc')
    setSortValue()

    expect(sortItems.value[2]).toEqual({
      key: 'in_stock:desc,price:asc',
      label: 'Suggested sort',
      config: [{ in_stock: 'desc' }, { price: 'asc' }]
    })
    expect(selectedKey.value).toBe('in_stock:desc,price:asc')
  })

  it('should use suggested sort label from options', () => {
    const { sortItems } = setup('rating:desc', { suggestedSort: 'Siūlomas rikiavimas' })

    expect(sortItems.value[2].label).toBe('Siūlomas rikiavimas')
  })

  it('should not add suggested sort for invalid sort param', () => {
    const { sortItems, setSortValue, selectedKey } = setup('unknown')
    setSortValue()

    expect(sortItems.value).toHaveLength(2)
    expect(selectedKey.value).toBe('relevance')
  })
})
