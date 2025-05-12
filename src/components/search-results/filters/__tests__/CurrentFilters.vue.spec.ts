import type { ResultCurrentFilterOptions } from '@/types/search-results/SearchResultsOptions'
import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CurrentFilters from '../CurrentFilters.vue'

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
  const pinia = createTestingPinia({
    initialState: {
      searchResult: {
        displayFilters: filters,
        hideFiltersOnExactMatchForKeys: [],
        currentFilterCount: filters.length,
        currentQueryText: ''
      }
    },
    stubActions: false
  })

  const wrapper = shallowMount(CurrentFilters, {
    global: { plugins: [pinia] },
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
    expect(wrapper.find('.lupa-search-result-current-filters').exists()).toBe(false)
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
      { key: 'tag',   label: 'Tag',   type: 'terms', value: '1' },
      { key: 'price', label: 'Price', type: 'range', value: '1 - 2' },
      { key: 'tag1',  label: 'Tag',   type: 'terms', value: '1' },
      { key: 'price1',label: 'Price', type: 'range', value: '1 - 2' }
    ])

    const tags = wrapper.findAll('.lupa-current-filter-tag')
    expect(tags).toHaveLength(4)
  })
})
