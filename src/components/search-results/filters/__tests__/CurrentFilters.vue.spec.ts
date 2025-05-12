import type { ResultCurrentFilterOptions } from '@/types/search-results/SearchResultsOptions'
import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useSearchResultStore } from '@/stores/searchResult'
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

describe('CurrentFilters.vue', () => {
  async function getComponent(
    filters: Array<{ key: string; label: string; type: string; value: string }>
  ) {
    const pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        options: {
          searchResultOptions: {
            filters: {
              facets: {
                stats: {
                  units: {} as Record<string,string>
                }
              }
            }
          }
        }
      }
    })

    const wrapper = shallowMount(CurrentFilters, {
      global: { plugins: [pinia] },
      props:  { options: baseOptions, expandable: false }
    })

    const store = useSearchResultStore()
    store.$patch(({
      displayFilters:                filters,
      hideFiltersOnExactMatchForKeys: [],
      currentFilterCount:            filters.length,
      currentQueryText:              ''
    } as any))

    await nextTick()
    return wrapper
  }

  it('does not render anything if there are no filters', async () => {
    const wrapper = await getComponent([])
    expect(
      wrapper.find('.lupa-search-result-current-filters').exists()
    ).toBe(false)
  })

  it('renders header and clear-all button when filters exist', async () => {
    const wrapper = await getComponent([
      { key: 'tag',   label: 'Tag',   type: 'terms', value: '1' },
      { key: 'price', label: 'Price', type: 'range', value: '1 - 2' }
    ])

    expect(
      wrapper.find('.lupa-filter-title-text').text()
    ).toBe(baseOptions.labels.title)

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
