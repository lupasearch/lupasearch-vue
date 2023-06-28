import { shallowMount } from '@vue/test-utils'
import SearchResultsProductPrice from '../SearchResultsProductPrice.vue'
import { vi } from 'vitest'
import { DocumentElementType } from '@/types/DocumentElement'

describe('SearchResultsProductPrice.vue', () => {
  beforeEach(() => {
    vi.mock('@/utils/price.utils', () => ({ formatPrice: vi.fn().mockReturnValue('0.15 $') }))
  })

  it('should render formatted price', () => {
    const wrapper = shallowMount(SearchResultsProductPrice, {
      propsData: {
        options: { type: DocumentElementType.REGULARPRICE, key: 'price' },
        item: { price: 0.15 }
      }
    })
    const element = wrapper.find('.lupa-search-results-product-price')
    expect(element.text()).toEqual('0.15 $')
  })
})
