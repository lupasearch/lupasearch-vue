/* eslint-disable @typescript-eslint/no-explicit-any */
import { VueWrapper, shallowMount } from '@vue/test-utils'
import SearchResultsProductAddToCart from '../SearchResultsProductAddToCart.vue'
import { createTestingPinia } from '@pinia/testing'
import { DocumentElementType } from '@/types/DocumentElement'
import { vi } from 'vitest'

describe('SearchResultsProductAddToCart.vue', () => {
  let wrapper: VueWrapper
  let wrapperVm: {
    handleClick: () => void
    loading: boolean
  }

  const action = vi.fn()

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsProductAddToCart, {
      global: {
        plugins: [createTestingPinia({})]
      },
      props: {
        options: {
          type: DocumentElementType.ADDTOCART,
          labels: {
            addToCart: 'Add to Cart'
          },
          action
        },
        item: { name: 'test' },
        inStock: true
      }
    })
    wrapperVm = wrapper.vm as any
    vi.spyOn(wrapperVm, 'handleClick')
  })

  it('should render correct label', () => {
    expect(wrapper.find('button').text()).toBe('Add to Cart')
  })

  it('should set loading class to the button when its clicked', async () => {
    const button = wrapper.find('button')
    button.trigger('click')
    expect(action).toHaveBeenCalled()
  })
})
