import type { ResultCurrentFilterOptions } from '@/types/search-results/SearchResultsOptions'
import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useSearchResultStore } from '@/stores/searchResult'
import { useOptionsStore } from '@/stores/options'
import CurrentFilters from '../CurrentFilters.vue'

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

describe('CurrentFilters', () => {
  const getComponent = async (
    filters: { key: string; label: string; type: string; value: string }[]
  ) => {
    const wrapper = shallowMount(CurrentFilters, {
      global: { plugins: [createTestingPinia({ stubActions: false })] },
      props:  { options: baseOptions, expandable: false }
    })

    const optionsStore = useOptionsStore()
    // @ts-ignore
    optionsStore.searchResultOptions.value = {
      filters: { facets: { stats: { units: {} } } }
    } as any

    const searchResultStore = useSearchResultStore()
    // @ts-ignore
    searchResultStore.filters                      = filters
    // @ts-ignore
    searchResultStore.displayFilters               = filters
    // @ts-ignore
    searchResultStore.hideFiltersOnExactMatchForKeys = []
    // @ts-ignore
    searchResultStore.currentFilterCount           = filters.length
    // @ts-ignore
    searchResultStore.currentQueryText             = ''

    await nextTick()
    return wrapper
  }

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

    expect(wrapper.find('.lupa-filter-title-text').text()).toBe(
      baseOptions.labels.title
    )
    expect(
      wrapper.find('.lupa-clear-all-filters').text()
    ).toBe(baseOptions.labels.clearAll)
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
