import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import CurrentFilters from '../CurrentFilters.vue'
import type { ResultCurrentFilterOptions } from '@/types/search-results/SearchResultsOptions'
import { useSearchResultStore } from '@/stores/searchResult'

const baseOptions: ResultCurrentFilterOptions = {
  labels: {
    title:    'Filters:',
    clearAll: 'Clear all:'
  },
  visibility: {
    mobileSidebar: false,
    mobileToolbar: false
  }
}

async function getComponent(
  filters: Array<{ key: string; label: string; type: string; value: string }>
) {
  const wrapper = shallowMount(CurrentFilters, {
    global: {
      plugins: [createTestingPinia()]
    },
    props: {
      options:    baseOptions,
      expandable: false
    }
  })

  const store = useSearchResultStore()
  // @ts-ignore
  store.filters                      = filters
  // @ts-ignore
  store.displayFilters               = filters
  // @ts-ignore
  store.currentFilterCount           = filters.length
  // @ts-ignore
  store.hideFiltersOnExactMatchForKeys = []
  // @ts-ignore
  store.currentQueryText             = ''

  await nextTick()
  return wrapper
}

describe('CurrentFilters.vue', () => {
  it('does not render anything when there are no filters', async () => {
    const wrapper = await getComponent([])
    expect(wrapper.find('.lupa-search-result-current-filters').exists()).toBe(false)
  })

  it('renders header and clear-all button when filters exist', async () => {
    const wrapper = await getComponent([
      { key: 'tag',   label: 'Tag',   type: 'terms', value: '1' },
      { key: 'price', label: 'Price', type: 'range', value: '1 - 2' }
    ])

    expect(wrapper.find('.lupa-filter-title-text').text()).toBe('Filters:')
    expect(wrapper.find('.lupa-clear-all-filters').text()).toBe('Clear all:')
  })

  it('renders exactly one tag per filter', async () => {
    const filters = [
      { key: 'a', label: 'A', type: 'terms', value: 'x' },
      { key: 'b', label: 'B', type: 'range', value: 'x - y' },
      { key: 'c', label: 'C', type: 'terms', value: 'z' }
    ]
    const wrapper = await getComponent(filters)
    expect(wrapper.findAll('.lupa-current-filter-tag')).toHaveLength(3)
  })
})
