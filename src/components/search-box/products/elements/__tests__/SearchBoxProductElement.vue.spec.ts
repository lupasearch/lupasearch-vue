import { mount } from '@vue/test-utils'
import SearchBoxProductElement from '../SearchBoxProductElement.vue'
import SearchBoxProductImage from '../SearchBoxProductImage.vue'
import SearchBoxProductTitle from '../SearchBoxProductTitle.vue'
import SearchBoxProductDescription from '../SearchBoxProductDescription.vue'
import {
  DescriptionDocumentElement,
  DocumentElement,
  DocumentElementType
} from '@/types/DocumentElement'
import { createTestingPinia } from '@pinia/testing'

describe('SearchBoxProductElement.vue', () => {
  it('should render image item type', () => {
    const wrapper = mount(SearchBoxProductElement, {
      global: {
        plugins: [createTestingPinia({})]
      },
      propsData: {
        element: { type: DocumentElementType.IMAGE } as DocumentElement,
        item: { name: 'Product title' }
      }
    })
    const element = wrapper.findComponent(SearchBoxProductImage)
    expect(element.exists()).toBe(true)
  })

  it('should render title item type', () => {
    const wrapper = mount(SearchBoxProductElement, {
      propsData: {
        element: { type: DocumentElementType.TITLE } as DocumentElement,
        item: { name: 'Product title' }
      }
    })
    const element = wrapper.findComponent(SearchBoxProductTitle)
    expect(element.exists()).toBe(true)
  })

  it('should render description item type', () => {
    const wrapper = mount(SearchBoxProductElement, {
      propsData: {
        element: { type: DocumentElementType.DESCRIPTION } as DocumentElement,
        item: { name: 'Product title' }
      }
    })
    const element = wrapper.findComponent(SearchBoxProductDescription)
    expect(element.exists()).toBe(true)
  })

  it('should not render element if display element returns false', () => {
    const wrapper = mount(SearchBoxProductElement, {
      propsData: {
        element: {
          type: DocumentElementType.DESCRIPTION,
          display: () => false
        } as unknown as DescriptionDocumentElement,
        item: { name: 'Product title' }
      }
    })
    const element = wrapper.findComponent(SearchBoxProductDescription)
    expect(element.exists()).toBe(false)
  })
})
