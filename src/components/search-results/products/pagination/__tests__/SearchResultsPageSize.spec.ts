/* eslint-disable @typescript-eslint/no-explicit-any */
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { DEFAULT_OPTIONS_RESULTS } from '@/constants/searchResults.const'
import { mount, VueWrapper } from '@vue/test-utils'
import SearchResultsPageSize from '../SearchResultsPageSize.vue'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'
import { useParamsStore } from '@/stores/params'

describe('SearchResultsPageSize', () => {
  let wrapper: VueWrapper
  let wrapperVm: any

  const pageSizes = DEFAULT_OPTIONS_RESULTS.pagination.sizeSelection.sizes

  beforeEach(() => {
    wrapper = mount(SearchResultsPageSize, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })]
      },
      props: {
        label: DEFAULT_OPTIONS_RESULTS.labels.pageSize,
        options: {
          sizes: DEFAULT_OPTIONS_RESULTS.pagination.sizeSelection.sizes,
          selectedSize: DEFAULT_OPTIONS_RESULTS.pagination.sizeSelection.sizes[1]
        }
      }
    })
    wrapperVm = wrapper.vm as any

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const location = new URL('https://www.example.com/search?q=abc') as any
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete window.location
    window.location = location
  })

  it('should change select value when option is selected', async () => {
    wrapper.find('select').trigger('click')
    wrapper.findAll('option').at(2).setSelected()

    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.value).toBe(pageSizes[2].toString())

    const paramsStore = useParamsStore()

    expect(paramsStore.appendParams).toHaveBeenCalledWith({
      params: [{ name: QUERY_PARAMS.LIMIT, value: pageSizes[2].toString() }],
      paramsToRemove: [QUERY_PARAMS.PAGE]
    })
  })
})
