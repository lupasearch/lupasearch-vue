import { vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import SearchBoxProductPrice from '../SearchBoxProductPrice.vue'
import { DocumentElementType } from '@/types/DocumentElement'

describe('SearchBoxProductPrice.vue', () => {
  beforeEach(() => {
    vi.mock('@/utils/price.utils', () => ({ formatPrice: vi.fn().mockReturnValue('0.15 $') }))
  })

  it('should render formatted price', () => {
    const wrapper = shallowMount(SearchBoxProductPrice, {
      propsData: {
        options: { type: DocumentElementType.REGULARPRICE, key: 'price' },
        item: { price: 0.15 }
      }
    })
    const element = wrapper.find('.lupa-search-box-product-price')
    expect(element.text()).toEqual('0.15 $')
  })
})
