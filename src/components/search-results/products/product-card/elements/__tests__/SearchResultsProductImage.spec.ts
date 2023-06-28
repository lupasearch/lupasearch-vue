import { mount } from '@vue/test-utils'
import SearchResultsProductImage from '../SearchResultsProductImage.vue'
import { DocumentElementType } from '@/types/DocumentElement'

describe('SearchResultsProductImage.vue', () => {
  it('should render placeholder if product has no image', () => {
    const wrapper = mount(SearchResultsProductImage, {
      propsData: {
        options: { key: 'image', placeholder: 'placeholder.jpg', type: DocumentElementType.IMAGE },
        item: { image: '' }
      }
    })
    const element = wrapper.find('.lupa-search-results-image')
    expect(element.attributes().src).toEqual('placeholder.jpg')
  })

  it('should render image if it is defined', () => {
    const wrapper = mount(SearchResultsProductImage, {
      propsData: {
        options: {
          key: 'imageUrl',
          placeholder: 'placeholder.jpg',
          type: DocumentElementType.IMAGE
        },
        item: { imageUrl: 'https://google.com/image/123' }
      }
    })
    const element = wrapper.find('.lupa-search-results-image')
    expect(element.attributes().src).toEqual('https://google.com/image/123')
  })

  it('should render image with base url', () => {
    const wrapper = mount(SearchResultsProductImage, {
      propsData: {
        options: {
          key: 'imageUrl',
          placeholder: 'placeholder.jpg',
          baseUrl: 'https://google.com/image',
          type: DocumentElementType.IMAGE
        },
        item: { imageUrl: '123.png' }
      }
    })
    const element = wrapper.find('.lupa-search-results-image')
    expect(element.attributes().src).toEqual('https://google.com/image/123.png')
  })

  it('should render image if it has no base url', () => {
    const wrapper = mount(SearchResultsProductImage, {
      propsData: {
        options: {
          key: 'imageUrl',
          placeholder: 'placeholder.jpg',
          type: DocumentElementType.IMAGE
        },
        item: { imageUrl: '123.png' }
      }
    })
    const element = wrapper.find('.lupa-search-results-image')
    expect(element.attributes().src).toEqual('/123.png')
  })

  it('should render image with custom url', () => {
    const wrapper = mount(SearchResultsProductImage, {
      propsData: {
        options: {
          key: 'imageUrl',
          placeholder: 'placeholder.jpg',
          type: DocumentElementType.IMAGE,
          customUrl: (doc: { imageUrl: string }) => `google.com/${doc.imageUrl}?quality=15`
        },
        item: { imageUrl: '124.png' }
      }
    })
    const element = wrapper.find('.lupa-search-results-image')
    expect(element.attributes().src).toEqual('google.com/124.png?quality=15')
  })
})
