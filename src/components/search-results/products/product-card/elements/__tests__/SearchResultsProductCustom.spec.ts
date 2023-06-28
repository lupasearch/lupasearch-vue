import { shallowMount } from '@vue/test-utils'
import SearchResultsProductCustom from '../SearchResultsProductCustom.vue'
import { CustomDocumentElement } from '@/types/DocumentElement'

describe('SearchResultsProductCustom.vue', () => {
  it('should render item text as simple string with custom class name', () => {
    const wrapper = shallowMount(SearchResultsProductCustom, {
      propsData: {
        options: { isHtml: false, key: 'name', className: 'custom-class' } as CustomDocumentElement,
        item: { name: '<div>Product title</div>' }
      }
    })
    const element = wrapper.find('.custom-class')
    expect(element.text()).toEqual('<div>Product title</div>')
  })

  it('should render item text as html string', () => {
    const wrapper = shallowMount(SearchResultsProductCustom, {
      propsData: {
        options: { isHtml: true, key: 'name', className: 'custom-class' } as CustomDocumentElement,
        item: { name: '<div>Product title</div>' }
      }
    })
    const element = wrapper.find('.custom-class')
    expect(element.text()).toEqual('Product title')
  })

  it('should render empty string if property is empty', () => {
    const wrapper = shallowMount(SearchResultsProductCustom, {
      propsData: {
        options: {
          isHtml: false,
          key: 'other',
          className: 'custom-class'
        } as CustomDocumentElement,
        item: { name: '<div>Product title</div>' }
      }
    })
    const element = wrapper.find('.custom-class')
    expect(element.text()).toEqual('')
  })
})
