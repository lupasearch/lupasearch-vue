import { shallowMount } from '@vue/test-utils'
import SearchResultsProductDescription from '../SearchResultsProductDescription.vue'
import { DocumentElementType } from '@/types/DocumentElement'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'

describe('SearchResultsProductDescription.vue', () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia())
  })

  it('should render item text as simple string', () => {
    const wrapper = shallowMount(SearchResultsProductDescription, {
      propsData: {
        options: { isHtml: false, key: 'description', type: DocumentElementType.DESCRIPTION },
        item: { description: '<div>Product description</div>' }
      }
    })
    const element = wrapper.find('.lupa-search-results-product-description')
    expect(element.text()).toEqual('<div>Product description</div>')
  })

  it('should render item text as html string', () => {
    const wrapper = shallowMount(SearchResultsProductDescription, {
      propsData: {
        options: { isHtml: true, key: 'description', type: DocumentElementType.DESCRIPTION },
        item: { description: '<div>Product description</div>' }
      }
    })
    const element = wrapper.find('.lupa-search-results-product-description')
    expect(element.text()).toEqual('Product description')
  })

  it('should render empty string if property is empty', () => {
    const wrapper = shallowMount(SearchResultsProductDescription, {
      propsData: {
        options: { isHtml: false, key: 'other', type: DocumentElementType.DESCRIPTION },
        item: { description: '<div>Product description</div>' }
      }
    })
    const element = wrapper.find('.lupa-search-results-product-description')
    expect(element.text()).toEqual('')
  })
})
