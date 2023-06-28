/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnchorPosition,
  SearchResultsProductCardOptions
} from '@/types/search-results/SearchResultsProductCardOptions'
import { shallowMount, VueWrapper } from '@vue/test-utils'
import SearchResultsProductCard from '../SearchResultsProductCard.vue'
import { ResultsLayoutEnum } from '@/types/search-results/ResultsLayout'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'

describe('SearchResultsProductCard', () => {
  let wrapper: VueWrapper
  let wrapperVm: any

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsProductCard, {
      global: {
        plugins: [createTestingPinia({})]
      },
      propsData: {
        options: {
          isInStock: (): boolean => {
            return true
          },
          badges: {
            anchor: 'tr' as AnchorPosition,
            elements: []
          },
          links: {
            details: '/{name}'
          },
          elements: []
        } as unknown as SearchResultsProductCardOptions,
        product: {
          name: 'test',
          price: '10'
        }
      }
    })
    wrapperVm = wrapper.vm as any
    vi.spyOn(window.location, 'assign')
  })

  it('should correctly check if product is in stock', () => {
    expect(wrapperVm.isInStock).toBeTruthy()
  })

  it('should have a link attribute', async () => {
    const cardLink = wrapper.find('a.lupa-search-result-product-image-section')
    expect(cardLink.attributes().href).toEqual('/test')
  })

  it("should add lupa-search-result-product-contents-list class when layout is 'List' and isAdditionalPanel is false", () => {
    if (wrapperVm.layout === ResultsLayoutEnum.LIST && !wrapperVm.isAdditionalPanel) {
      expect(wrapper.find('#lupa-search-result-product-contents-list').exists()).toBeTruthy()
    } else {
      expect(wrapper.find('#lupa-search-result-product-contents-list').exists()).toBeFalsy()
    }
  })
})
