import { shallowMount } from '@vue/test-utils'
import type { LabeledFilter } from '@/types/search-results/Filters'
import CurrentFilters from '@/components/search-results/filters/CurrentFilters.vue'
import { toggleTermFilter, toggleHierarchyFilter } from '@/utils/filter.toggle.utils'

jest.mock('@/utils/filter.toggle.utils', () => ({
  toggleTermFilter: jest.fn(),
  toggleHierarchyFilter: jest.fn(),
}))

const mockParamsStore = {
  removeAllFilters: jest.fn(),
  appendParams:     jest.fn(),
  removeParameters: jest.fn(),
}
jest.mock('@/stores/params', () => ({
  useParamsStore: () => mockParamsStore
}))

jest.mock('@/stores/options', () => {
  const { ref } = require('vue')
  return {
    useOptionsStore: () => ({
      searchResultOptions: ref({
        filters: { facets: { stats: { units: {} as Record<string,string> } } }
      }),
      getQueryParamName: (k: string) => k
    })
  }
})

const mockSearchResultStore: {
  filters:                LabeledFilter[]
  displayFilters:         LabeledFilter[]
  currentFilterCount:     number
  hideFiltersOnExactMatchForKeys: string[]
  currentQueryText:       string
} = {
  filters:                    [],
  displayFilters:             [],
  currentFilterCount:         0,
  hideFiltersOnExactMatchForKeys: [],
  currentQueryText:           '',
}
jest.mock('@/stores/searchResult', () => ({
  useSearchResultStore: () => mockSearchResultStore
}))


describe('CurrentFilters.vue', () => {
  const defaultProps = {
    options:    { labels: { title: 'Active Filters', clearAll: 'Clear All' } },
    expandable: false
  }

  function setup({
    filters = [] as LabeledFilter[],
    displayFilters = [] as LabeledFilter[],
    units = {} as Record<string,string>,
    expandable = false
  } = {}) {
    mockParamsStore.removeAllFilters.mockClear()
    mockParamsStore.appendParams.mockClear()
    mockParamsStore.removeParameters.mockClear()
    ;(toggleTermFilter as jest.Mock).mockClear()
    ;(toggleHierarchyFilter as jest.Mock).mockClear()

    const optionsStore = require('@/stores/options').useOptionsStore()
    optionsStore.searchResultOptions.value.filters.facets.stats.units = units

    mockSearchResultStore.filters                    = filters
    mockSearchResultStore.displayFilters             = displayFilters
    mockSearchResultStore.currentFilterCount         = displayFilters.length
    mockSearchResultStore.hideFiltersOnExactMatchForKeys = []
    mockSearchResultStore.currentQueryText           = ''

    const wrapper = shallowMount(CurrentFilters, {
      props: { ...defaultProps, expandable }
    })

    return { wrapper, paramsStore: mockParamsStore }
  }

  it('renders nothing when there are no filters', () => {
    const { wrapper } = setup()
    expect(wrapper.html()).toBe('')
  })

  it('renders title and filter tags when filters exist', () => {
    const my: LabeledFilter[] = [
      { type: 'terms', key: 'color', value: 'red', label: 'Color' }
    ]
    const { wrapper } = setup({ filters: my, displayFilters: my })
    expect(wrapper.text()).toContain('Active Filters')
    const tag = wrapper.find('.lupa-current-filter-tag')
    expect(tag.exists()).toBe(true)
    expect(tag.text()).toContain('Color')
    expect(tag.text()).toContain('red')
  })

  it('calls removeAllFilters on "Clear All" click', async () => {
    const my: LabeledFilter[] = [
      { type: 'terms', key: 'size', value: 'M', label: 'Size' }
    ]
    const { wrapper, paramsStore } = setup({ filters: my, displayFilters: my })
    await wrapper.find('.lupa-clear-all-filters').trigger('click')
    expect(paramsStore.removeAllFilters).toHaveBeenCalled()
  })

  it('invokes toggleTermFilter when removing a terms filter', async () => {
    const my: LabeledFilter[] = [
      { type: 'terms', key: 'brand', value: 'nike', label: 'Brand' }
    ]
    const { wrapper } = setup({ filters: my, displayFilters: my })
    await wrapper.find('button').trigger('click')

    expect(toggleTermFilter).toHaveBeenCalledWith(
      mockParamsStore.appendParams,
      { type: 'terms', key: 'brand', value: 'nike' },
      expect.any(Function),
      mockSearchResultStore.filters
    )
  })

  it('invokes toggleHierarchyFilter when removing a hierarchy filter', async () => {
    const my: LabeledFilter[] = [
      { type: 'hierarchy', key: 'category', value: 'shoes', label: 'Category' }
    ]
    const { wrapper } = setup({ filters: my, displayFilters: my })
    await wrapper.find('button').trigger('click')

    expect(toggleHierarchyFilter).toHaveBeenCalledWith(
      mockParamsStore.appendParams,
      { type: 'hierarchy', key: 'category', value: 'shoes' },
      expect.any(Function),
      mockSearchResultStore.filters,
      true
    )
  })

  it('removes range params when removing a range filter', async () => {
    const myFilters = [{
      type:  'range',
      key:   'price',
      value: ['10','50'],
      label: 'Price'
    }] as unknown as LabeledFilter[]

    const { wrapper } = setup({ filters: myFilters, displayFilters: myFilters })
    await wrapper.find('button').trigger('click')

    expect(mockParamsStore.removeParameters).toHaveBeenCalledWith({
      paramsToRemove: [
        expect.stringMatching(/PAGE/),
        `rangeprice`
      ]
    })
  })

  it('formats single-value filters correctly', () => {
    const my: LabeledFilter[] = [
      { type: 'terms', key: 'weight', value: 'heavy', label: 'Weight' }
    ]
    const { wrapper } = setup({ filters: my, displayFilters: my, units: { weight: 'kg' } })
    const vm = wrapper.vm as any
    expect(vm.formatFilterValue(my[0])).toBe('heavy kg')
  })

  it('formats array-range filters correctly', () => {
    const rangeFilter = {
      type:  'range',
      key:   'age',
      value: ['18','30'],
      label: 'Age'
    } as unknown as LabeledFilter

    const { wrapper } = setup({
      filters:        [rangeFilter],
      displayFilters: [rangeFilter],
      units:          { age: 'years' }
    })
    const vm = wrapper.vm as any
    expect(vm.formatFilterValue(rangeFilter)).toBe('18 years – 30 years')
  })

  it('parses and formats "min - max" string-range filters', () => {
    const stringRange: LabeledFilter = {
      type:  'range',
      key:   'length',
      value: '5 - 10',
      label: 'Length'
    }
    const { wrapper } = setup({
      filters:        [stringRange],
      displayFilters: [stringRange],
      units:          { length: 'm' }
    })
    const vm = wrapper.vm as any
    expect(vm.formatFilterValue(stringRange)).toBe('5 m – 10 m')
  })
})
