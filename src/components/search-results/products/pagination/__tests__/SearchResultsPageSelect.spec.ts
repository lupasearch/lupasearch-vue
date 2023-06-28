/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFAULT_OPTIONS_RESULTS } from '@/constants/searchResults.const'
import { mount, VueWrapper } from '@vue/test-utils'
import SearchResultsPageSelect from '../SearchResultsPageSelect.vue'
import { createTestingPinia } from '@pinia/testing'

describe('SearchResultsPageSelect', () => {
  let wrapper: VueWrapper
  let wrapperVm: any

  beforeEach(() => {
    wrapper = mount(SearchResultsPageSelect, {
      global: {
        plugins: [createTestingPinia({})]
      },
      props: {
        options: {
          count: 50,
          selectedPage: 1,
          display: 5,
          displayMobile: 5
        },
        lastPageLabel: DEFAULT_OPTIONS_RESULTS.labels.showMore
      }
    })
    wrapperVm = wrapper.vm as any
  })

  it('should display correct label', () => {
    expect(
      wrapper.findAll('div').filter((x) => x.text() === DEFAULT_OPTIONS_RESULTS.labels.showMore)
        .length
    ).not.toBe(0)
  })

  it('should display correct pages', async () => {
    expect(wrapperVm.pages).toStrictEqual([1, 2, 3])

    wrapper.setProps({
      options: {
        count: 50,
        selectedPage: 5,
        display: 5
      }
    })
    await wrapper.vm.$nextTick()

    expect(wrapperVm.pages).toStrictEqual([3, 4, 5, 6, 7])

    wrapper.setProps({
      options: {
        count: 8,
        selectedPage: 8,
        display: 5
      }
    })
    await wrapper.vm.$nextTick()

    expect(wrapperVm.pages).toStrictEqual([6, 7, 8])
  })
})
