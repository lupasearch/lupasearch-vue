/* eslint-disable @typescript-eslint/no-explicit-any */
import SearchBox from '@/components/search-box/SearchBox.vue'
import { SuggestionsMockData } from '@/constants/mockData..const'
import { DEFAULT_SEARCH_BOX_OPTIONS } from '@/constants/searchBox.const'
import { FetchedData, InputSuggestion } from '@/types/search-box/Common'
import {
  SearchBoxInputOptions,
  SearchBoxOptions,
  SearchBoxPanelOptions
} from '@/types/search-box/SearchBoxOptions'
import { SearchBoxPanelType } from '@/types/search-box/SearchBoxPanel'
import { Suggestion } from '@getlupa/client-sdk/Types'
import { mount, VueWrapper } from '@vue/test-utils'
import SearchBoxInput from '../SearchBoxInput.vue'
import { SdkOptions } from '@/types/General'
import { vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'

const mountSearchBox = () => {
  return mount(SearchBox, {
    props: { options: DEFAULT_SEARCH_BOX_OPTIONS as SearchBoxOptions },
    global: {
      plugins: [createTestingPinia({})]
    },
    data() {
      return {
        suggestedValue: {
          item: SuggestionsMockData.items[0],
          override: false,
          queryKey: '123'
        }
      }
    },
    stubs: { SearchBoxMainPanel: { template: '<span/>' } }
  })
}

describe('SearchBox.vue', () => {
  let searchBox: VueWrapper
  let searchBoxVm: any

  beforeEach(() => {
    searchBox = mountSearchBox()
    searchBoxVm = searchBox.vm as any

    vi.spyOn(window.history, 'pushState')
  })

  it('check panelOptions', () => {
    expect(searchBoxVm.panelOptions).toStrictEqual<SearchBoxPanelOptions>({
      minInputLength: DEFAULT_SEARCH_BOX_OPTIONS.minInputLength,
      panels: DEFAULT_SEARCH_BOX_OPTIONS.panels as any[],
      history: DEFAULT_SEARCH_BOX_OPTIONS.history,
      labels: DEFAULT_SEARCH_BOX_OPTIONS.labels,
      links: DEFAULT_SEARCH_BOX_OPTIONS.links,
      options: DEFAULT_SEARCH_BOX_OPTIONS.options as SdkOptions,
      debounce: DEFAULT_SEARCH_BOX_OPTIONS.debounce,
      showTotalCount: DEFAULT_SEARCH_BOX_OPTIONS.showTotalCount,
      hideMoreResultsButtonOnNoResults: undefined,
      showMoreResultsButton: undefined,
      showNoResultsPanel: undefined,
      expandOnSinglePanel: undefined,
      initialFilters: undefined
    })
  })

  it('check inputOptions', () => {
    expect(searchBoxVm.inputOptions).toStrictEqual<SearchBoxInputOptions>({
      minInputLength: DEFAULT_SEARCH_BOX_OPTIONS.minInputLength,
      labels: DEFAULT_SEARCH_BOX_OPTIONS.labels,
      links: DEFAULT_SEARCH_BOX_OPTIONS.links,
      inputAttributes: DEFAULT_SEARCH_BOX_OPTIONS.inputAttributes,
      showSubmitButton: undefined
    })
  })

  it('handle items fetch', () => {
    const fetchedData: FetchedData = {
      items: SuggestionsMockData.items,
      type: SearchBoxPanelType.SUGGESTION
    }
    searchBoxVm.handleItemsFetch(fetchedData)
    expect(searchBoxVm.suggestedValue).toStrictEqual<InputSuggestion>({
      item: fetchedData.items[0] as Suggestion,
      override: false,
      queryKey: ''
    })
  })

  it('when TAB is clicked, input should be filled with suggestion', async () => {
    const suggestionValue = SuggestionsMockData.items[0].suggestion

    searchBox = mountSearchBox()
    searchBoxVm = searchBox.vm as any

    // Substitute for actual Tab click (can't simulate KeyboardEvent with specific target)
    searchBoxVm.selectSuggestion({
      item: SuggestionsMockData.items[0],
      override: true,
      queryKey: '123'
    })

    expect(searchBoxVm.inputValue).toBe(suggestionValue)
    expect(searchBoxVm.suggestedValue).toStrictEqual<InputSuggestion>({
      item: SuggestionsMockData.items[0],
      override: true,
      queryKey: '123'
    })

    await searchBox.vm.$nextTick()

    const input = searchBox.findComponent(SearchBoxInput)

    expect((input.vm as any).input).toBe(suggestionValue)

    expect((input.find('input').element as HTMLInputElement).value).toBe(suggestionValue)
  })
})
