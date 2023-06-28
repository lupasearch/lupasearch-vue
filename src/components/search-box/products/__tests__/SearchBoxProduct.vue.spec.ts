import { vi } from 'vitest'

import { shallowMount } from '@vue/test-utils'
import SearchBoxProduct from '../SearchBoxProduct.vue'
import { generateLink } from '@/utils/link.utils'
import SearchBoxProductElement from '../elements/SearchBoxProductElement.vue'
import { DocumentSearchBoxPanel, SearchBoxPanelBase } from '@/types/search-box/SearchBoxPanel'
import { DocumentElementType } from '@/types/DocumentElement'
import { createTestingPinia } from '@pinia/testing'
import { Document } from '@getlupa/client-sdk/Types'

const getComponent = ({
  panelOptions,
  item
}: {
  panelOptions: DocumentSearchBoxPanel
  item: Document
}) => {
  const wrapper = shallowMount(SearchBoxProduct, {
    global: {
      plugins: [createTestingPinia({})]
    },
    propsData: {
      panelOptions,
      item,
      inputValue: ''
    }
  })
  return wrapper
}

describe('SearchBoxProduct.vue', () => {
  beforeEach(() => {
    vi.mock('@/utils/link.utils', () => ({
      generateLink: vi.fn().mockReturnValue('https://lupasearch.com/link')
    }))
  })

  it('should be rendered', () => {
    const wrapper = getComponent({
      panelOptions: { links: { details: '{url}' } } as DocumentSearchBoxPanel,
      item: { url: 'test' }
    })
    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('should render a correct link', () => {
    const wrapper = getComponent({
      panelOptions: { links: { details: '{url}' } } as DocumentSearchBoxPanel,
      item: { url: 'test' }
    })
    const product = wrapper.find('a')
    expect(product.attributes().href).toEqual('https://lupasearch.com/link')
    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('should render no elements if there are no elements passed in config', () => {
    const wrapper = getComponent({
      panelOptions: { links: { details: '{url}' }, elements: [] } as DocumentSearchBoxPanel,
      item: { url: 'test' }
    })
    const elements = wrapper.findAllComponents(SearchBoxProductElement)
    expect(elements.length).toBe(0)
  })

  it('should render correct number of components passed in config', () => {
    const wrapper = getComponent({
      panelOptions: {
        links: { details: '{url}' },
        elements: [
          { type: DocumentElementType.CUSTOM, key: 'key1' },
          { type: DocumentElementType.CUSTOM, key: 'key2' }
        ]
      } as DocumentSearchBoxPanel,
      item: { url: 'test' }
    })
    const elements = wrapper.findAllComponents(SearchBoxProductElement)
    expect(elements.length).toBe(2)
  })

  it('should render image element in separate wrapper', () => {
    const wrapper = getComponent({
      panelOptions: {
        links: { details: '{url}' },
        elements: [
          { type: DocumentElementType.IMAGE, key: 'image' },
          { type: DocumentElementType.CUSTOM, key: 'key2' },
          { type: DocumentElementType.CUSTOM, key: 'key3' }
        ]
      } as DocumentSearchBoxPanel,
      item: { url: 'test' }
    })
    const imageElements = wrapper.findAll(
      '.lupa-search-box-product-image-section > .lupa-search-box-product-element'
    )
    expect(imageElements.length).toBe(1)
    const detailElements = wrapper.findAll(
      '.lupa-search-box-product-details-section > .lupa-search-box-product-element'
    )
    expect(detailElements.length).toBe(2)
  })
})
