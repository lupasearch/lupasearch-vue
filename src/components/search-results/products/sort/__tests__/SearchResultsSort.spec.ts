/* eslint-disable @typescript-eslint/no-explicit-any */
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { DEFAULT_OPTIONS_RESULTS } from '@/constants/searchResults.const'

import { mount, VueWrapper } from '@vue/test-utils'
import SearchResultsSort from '../SearchResultsSort.vue'
import { createTestingPinia } from '@pinia/testing'
import { useParamsStore } from '@/stores/params'

const sort = [
  { key: 's1', label: '', config: [] },
  { key: 's2', label: '', config: [] }
]

describe('SearchResultsSort', () => {
  let wrapper: VueWrapper
  let wrapperVm: any

  beforeEach(() => {
    wrapper = mount(SearchResultsSort, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              options: {
                searchResultOptions: {
                  sort
                }
              }
            }
          })
        ]
      },
      props: {
        options: {
          label: DEFAULT_OPTIONS_RESULTS.labels.sortBy,
          options: sort
        }
      }
    })
    wrapperVm = wrapper.vm

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const location = new URL('https://www.example.com/search?q=abc') as any
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete window.location
    window.location = location
  })

  it('should change select value when option is selected', async () => {
    const paramStore = useParamsStore()

    wrapper.find('select').trigger('click')
    wrapper.findAll('option').at(1).setValue(sort[1].key)

    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.value).toBe(sort[1].key)

    const key = sort.find((x: any) => x.key === sort[1].key)?.key
    expect(paramStore.appendParams).toHaveBeenCalledWith({
      params: [{ name: QUERY_PARAMS.SORT, value: key }],
      paramsToRemove: [QUERY_PARAMS.PAGE]
    })
  })
})
