import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import { vi, describe, it, expect } from 'vitest'
import CurrentFilterDisplay from '../CurrentFilterDisplay.vue'
import type { LabeledFilter } from '@/types/search-results/Filters'

vi.mock('@/stores/options', () => ({
  useOptionsStore: () => ({
    searchResultOptions: ref({
      filters: { facets: { stats: { units: {} as Record<string, string> } } }
    })
  })
}))


describe('CurrentFilterDisplay.vue', () => {
  const makeFilter = (): LabeledFilter => ({
    key: 'tag',
    label: 'Tag',
    type: 'terms',
    value: 'books'
  })

  const getWrapper = (filter: LabeledFilter) =>
    shallowMount(CurrentFilterDisplay, {
      props: { filter }
    })

  it('renders the wrapper container', () => {
    const wrapper = getWrapper(makeFilter())
    expect(
      wrapper.find('.lupa-search-result-filter-value').exists()
    ).toBe(true)
  })

  it('renders the correct label (with colon)', () => {
    const wrapper = getWrapper(makeFilter())
    const labelDiv = wrapper.find('.lupa-current-filter-label')
    expect(labelDiv.exists()).toBe(true)
    expect(labelDiv.text()).toBe('Tag:')
  })

  it('renders the correct formatted value', () => {
    const wrapper = getWrapper(makeFilter())
    const valueDiv = wrapper.find('.lupa-current-filter-value')
    expect(valueDiv.exists()).toBe(true)
    expect(valueDiv.text()).toBe('books')
  })
})
