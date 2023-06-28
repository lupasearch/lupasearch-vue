import { describe, expect, it, vi } from 'vitest'
import { DisplaySuggestion } from '@/types/search-box/Common'
import SearchBoxSuggestions from '../SearchBoxSuggestions.vue'
import { VueWrapper, mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useSearchBoxStore } from '@/stores/searchBox'
import { DisplaySuggestionsMockData } from '@/constants/mockData..const'

const queryKey = 'key123'

const getSuggestions = (wrapper: VueWrapper) => {
  return wrapper.findAll('div').filter((x) => x.classes('lupa-suggestion'))
}

const getComponent = ({
  suggestions,
  highlight = false,
  highlightedIndex = -1
}: {
  suggestions: DisplaySuggestion[]
  highlight?: boolean
  highlightedIndex?: number
}) => {
  const pinia = createTestingPinia({
    initialState: {
      searchBox: {
        suggestionResults: {
          [queryKey]: suggestions
        }
      }
    }
  })
  const wrapper = mount(SearchBoxSuggestions, {
    global: {
      plugins: [pinia]
    },
    props: {
      queryKey,
      items: suggestions,
      highlight,
      labels: {} as any
    }
  })

  const searchBoxStore = useSearchBoxStore(pinia)
  // @ts-expect-error: getters can be overriden in tests according to docs
  searchBoxStore.highlightedItem = {
    index: highlightedIndex,
    queryKey
  }

  return wrapper
}

describe('Suggestions', () => {
  it('suggestions should be displayed without highlight', () => {
    const input = 'kny'
    const mockData = DisplaySuggestionsMockData(input)
    const wrapper = getComponent({ suggestions: mockData })

    const suggestions = getSuggestions(wrapper)

    mockData.forEach((data, index) => {
      const suggestion = suggestions.at(index)
      expect(suggestion.text()).toBe(data.suggestion.suggestion)
    })
  })

  it('suggestions should be displayed with highlight', () => {
    const input = 'kny'
    const mockData = DisplaySuggestionsMockData(input)
    const wrapper = getComponent({ suggestions: mockData, highlight: true })

    const suggestions = getSuggestions(wrapper)

    mockData.forEach((data, index) => {
      const suggestion = suggestions.at(index)
      expect(suggestion.html()).toContain(data.displayHighlight)
      expect(suggestion.find('strong').text()).toBe(input)
    })
  })

  it('highlight class should not be added when suggestion is not highlighted', async () => {
    const input = 'kny'
    const mockData = DisplaySuggestionsMockData(input)
    const wrapper = getComponent({ suggestions: mockData })
    expect(wrapper.find('.lupa-suggestion-highlighted').exists()).toBe(false)
  })

  it('highlight class should be added when suggestion is highlighted', async () => {
    const input = 'kny'
    const mockData = DisplaySuggestionsMockData(input)
    const wrapper = getComponent({
      suggestions: mockData,
      highlightedIndex: 2
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.lupa-suggestion-highlighted').exists()).toBe(true)
    expect(wrapper.find('.lupa-suggestion-highlighted').text()).toBe('knygų akcija')
  })
})
