import { ResultCurrentFilterOptions } from '@/types/search-results/SearchResultsOptions'
import { shallowMount } from '@vue/test-utils'
import CurrentFilters from '../CurrentFilters.vue'
import CurrentFilterDisplay from '../CurrentFilterDisplay.vue'
import { vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
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

const getComponent = async (
  filters: { key: string; label: string; type: string; value: string }[]
) => {
  const wrapper = shallowMount(CurrentFilters, {
    global: {
      plugins: [createTestingPinia({})]
    },
    props: {
      options: baseOptions,
      expandable: false
    }
  })
  const searchResultStore = useSearchResultStore()
  // @ts-ignore
  searchResultStore.displayFilters = filters

  await wrapper.vm.$nextTick()
  return wrapper
}

describe('FacetList', () => {
  beforeEach(() => {})

  it('should not render anything if there are no filters', async () => {
    const wrapper = await getComponent([])
    expect(wrapper.find('.lupa-search-result-current-filters').exists()).toBe(false)
  })

  it('should render filter section if at least one filter is visible', async () => {
    const wrapper = await getComponent([
      { key: 'tag', label: 'Tag', type: 'terms', value: '1' },
      { key: 'price', label: 'Price', type: 'range', value: '1 - 2' }
    ])
    expect(wrapper.find('.lupa-filter-title-text').text()).toBe('Filters:')
    expect(wrapper.find('.lupa-clear-all-filters').text()).toBe('Clear all:')
  })

  it('should render a given number of filters', async () => {
    const wrapper = await getComponent([
      { key: 'tag', label: 'Tag', type: 'terms', value: '1' },
      { key: 'price', label: 'Price', type: 'range', value: '1 - 2' },
      { key: 'tag1', label: 'Tag', type: 'terms', value: '1' },
      { key: 'price1', label: 'Price', type: 'range', value: '1 - 2' }
    ])
    expect(wrapper.findAllComponents(CurrentFilterDisplay).length).toBe(4)
  })
})
