
import { nextTick, ref } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import type { ResultCurrentFilterOptions } from '@/types/search-results/SearchResultsOptions'
import CurrentFilters from '../CurrentFilters.vue'

const mockSearchResultOptions = ref({
  filters: {
    facets: {
      stats: { units: {} }
    }
  }
})
const mockGetQueryParamName = vi.fn((key: string) => key)

vi.mock('@/stores/options', () => ({
  useOptionsStore: () => ({
    searchResultOptions: mockSearchResultOptions,
    getQueryParamName: mockGetQueryParamName
  })
}))

vi.mock('@/stores/searchResult', () => ({
  useSearchResultStore: () => ({
    displayFilters: [] as any[],
    hideFiltersOnExactMatchForKeys: [] as string[],
    currentFilterCount: 0,
    currentQueryText: '',
    removeAllFilters: vi.fn()
  })
}))

import { useSearchResultStore } from '@/stores/searchResult'

const baseOptions: ResultCurrentFilterOptions = {
  labels: {
    title: 'Filters:',
    clearAll: 'Clear all:'
  },
  visibility: {
    mobileSidebar: false,
    mobileToolbar: false
  }
}

async function getComponent(
  filters: { key: string; label: string; type: string; value: string }[]
) {
  // Grab our mocked store and overwrite its fields
  const store = (useSearchResultStore() as any)
  store.displayFilters = filters
  store.hideFiltersOnExactMatchForKeys = []
  store.currentFilterCount = filters.length
  store.currentQueryText = ''

  const wrapper = shallowMount(CurrentFilters, {
    props: {
      options: baseOptions,
      expandable: false
    }
  })

  await nextTick()
  return wrapper
}

describe('CurrentFilters', () => {
  it('should not render anything if there are no filters', async () => {
    const wrapper = await getComponent([])
    expect(
      wrapper.find('.lupa-search-result-current-filters').exists()
    ).toBe(false)
  })

  it('should render filter section if at least one filter is visible', async () => {
    const wrapper = await getComponent([
      { key: 'tag',   label: 'Tag',   type: 'terms', value: '1' },
      { key: 'price', label: 'Price', type: 'range', value: '1 - 2' }
    ])

    expect(wrapper.find('.lupa-filter-title-text').text()).toBe('Filters:')
    expect(wrapper.find('.lupa-clear-all-filters').text()).toBe('Clear all:')
  })

  it('should render a given number of filters', async () => {
    const wrapper = await getComponent([
      { key: 'tag',    label: 'Tag',   type: 'terms', value: '1'   },
      { key: 'price',  label: 'Price', type: 'range', value: '1 - 2' },
      { key: 'tag1',   label: 'Tag',   type: 'terms', value: '1'   },
      { key: 'price1', label: 'Price', type: 'range', value: '1 - 2' }
    ])

    const tags = wrapper.findAll('.lupa-current-filter-tag')
    expect(tags).toHaveLength(4)
  })
})
