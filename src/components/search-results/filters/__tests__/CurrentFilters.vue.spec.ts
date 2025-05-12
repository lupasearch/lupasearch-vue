import { shallowMount } from '@vue/test-utils'
import { ref, nextTick, Ref } from 'vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import CurrentFilters from '../CurrentFilters.vue'
import type { ResultCurrentFilterOptions } from '@/types/search-results/SearchResultsOptions'
import type { LabeledFilter } from '@/types/search-results/Filters'

vi.mock('@/utils/filter.toggle.utils', () => ({
  toggleTermFilter:     vi.fn(),
  toggleHierarchyFilter: vi.fn(),
}))

const mockParamsStore = {
  removeAllFilters: vi.fn(),
  appendParams:     vi.fn(),
  removeParameters: vi.fn(),
}
vi.mock('@/stores/params', () => ({
  useParamsStore: () => mockParamsStore
}))

vi.mock('@/stores/options', () => {
  return {
    useOptionsStore: () => ({
      searchResultOptions: ref({
        filters: { facets: { stats: { units: {} as Record<string,string> } } }
      }),
      getQueryParamName: (k: string) => k
    })
  }
})

const mockSearchResultStore = {
  filters:                     ref([]) as Ref<LabeledFilter[]>,
  displayFilters:              ref([]) as Ref<LabeledFilter[]>,
  currentFilterCount:          ref(0),
  hideFiltersOnExactMatchForKeys: ref([] as string[]),
  currentQueryText:            ref(''),
}
vi.mock('@/stores/searchResult', () => ({
  useSearchResultStore: () => mockSearchResultStore
}))

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
  beforeEach(() => {
    mockParamsStore.removeAllFilters.mockClear()
    mockParamsStore.appendParams.mockClear()
    mockParamsStore.removeParameters.mockClear()

    mockSearchResultStore.filters.value = []
    mockSearchResultStore.displayFilters.value = []
    mockSearchResultStore.currentFilterCount.value = 0
    mockSearchResultStore.hideFiltersOnExactMatchForKeys.value = []
    mockSearchResultStore.currentQueryText.value = ''
  })

  async function getComponent(filters: LabeledFilter[]) {
    mockSearchResultStore.filters.value = filters
    mockSearchResultStore.displayFilters.value = filters
    mockSearchResultStore.currentFilterCount.value = filters.length

    const wrapper = shallowMount(CurrentFilters, {
      props: { options: baseOptions, expandable: false }
    })

    await nextTick()
    return wrapper
  }

  it('does not render anything if there are no filters', async () => {
    const wrapper = await getComponent([])
    expect(wrapper.find('.lupa-search-result-current-filters').exists()).toBe(false)
  })

  it('renders header and clear-all button when filters exist', async () => {
    const wrapper = await getComponent([
      { type: 'terms',     key: 'tag',   value: '1',   label: 'Tag'   },
      { type: 'range',     key: 'price', value: '1 - 2', label: 'Price' }
    ])
    expect(wrapper.find('.lupa-filter-title-text').text()).toBe(
      baseOptions.labels.title
    )
    expect(wrapper.find('.lupa-clear-all-filters').text()).toBe(
      baseOptions.labels.clearAll
    )
  })

  it('should render a given number of filters', async () => {
    const items: LabeledFilter[] = [
      { type: 'terms', key: 'tag',   value: '1',   label: 'Tag'   },
      { type: 'range', key: 'price', value: '1 - 2', label: 'Price' },
      { type: 'terms', key: 'tag1',  value: '1',   label: 'Tag'   },
      { type: 'range', key: 'price1',value: '1 - 2', label: 'Price' }
    ]
    const wrapper = await getComponent(items)
    expect(wrapper.findAll('.lupa-current-filter-tag')).toHaveLength(4)
  })
})
