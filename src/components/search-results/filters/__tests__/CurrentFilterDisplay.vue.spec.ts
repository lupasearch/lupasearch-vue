import { LabeledFilter } from '@/types/search-results/Filters'
import { shallowMount } from '@vue/test-utils'
import CurrentFilterDisplay from '../CurrentFilterDisplay.vue'

const getComponent = (filter: LabeledFilter) => {
  return shallowMount(CurrentFilterDisplay, {
    props: {
      filter
    }
  })
}

describe('CurrentFilterDisplay', () => {
  it('should be rendered', () => {
    const wrapper = getComponent({
      key: 'tag',
      label: 'Tag',
      value: 'books',
      type: 'terms'
    })
    expect(wrapper.find('.lupa-search-result-filter-value').exists()).toBe(true)
  })

  it('should be filter label and value', () => {
    const wrapper = getComponent({
      key: 'tag',
      label: 'Tag',
      value: 'books',
      type: 'terms'
    })
    expect(wrapper.find('.lupa-current-filter-label').text()).toBe('Tag:')
    expect(wrapper.find('.lupa-current-filter-value').text()).toBe('books')
  })
})
