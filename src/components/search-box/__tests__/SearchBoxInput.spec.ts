/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallowMount, VueWrapper } from '@vue/test-utils'
import SearchBoxInput from '@/components/search-box/SearchBoxInput.vue'
import { DEFAULT_SEARCH_BOX_OPTIONS } from '@/constants/searchBox.const'
import { SuggestionsMockData } from '@/constants/mockData..const'
import { createTestingPinia } from '@pinia/testing'

describe('SearchBoxInput', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchBoxInput, {
      global: {
        plugins: [createTestingPinia({})]
      },
      props: {
        suggestedValue: {
          item: SuggestionsMockData.items[0],
          override: false,
          queryKey: ''
        },
        options: {
          minInputLength: DEFAULT_SEARCH_BOX_OPTIONS.minInputLength,
          labels: DEFAULT_SEARCH_BOX_OPTIONS.labels,
          links: DEFAULT_SEARCH_BOX_OPTIONS.links
        }
      }
    })
  })

  it('suggestion hint should be displayed', async () => {
    const input = wrapper.find('.lupa-search-box-input-field')
    await input.setValue(SuggestionsMockData.items[0].suggestion.slice(0, 2))
    const hintField: HTMLInputElement = wrapper.find('.lupa-hint').element as HTMLInputElement
    const value = hintField.value
    expect(value).toMatch(SuggestionsMockData.items[0].suggestion)
  })

  it('input should be displayed', () => {
    const text = 'Knyga'
    const input = wrapper.find('.lupa-search-box-input-field')
    input.setValue(text)
    expect((input.element as HTMLInputElement).value).toMatch(text)
  })
})
