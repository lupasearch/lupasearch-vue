/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchResultsAdditionalPanelOptions } from '@/types/search-results/SearchResultsAdditionalPanelOptions'
import { SearchResultsAdditionalPanels } from '@/types/search-results/SearchResultsOptions'
import { shallowMount } from '@vue/test-utils'
import AdditionalPanels from '../AdditionalPanels.vue'
import AdditionalPanel from '../AdditionalPanel.vue'
import { SdkOptions } from '@/types/General'

const baseOptions: SearchResultsAdditionalPanels = {
  additionalPanels: []
}

const getComponent = (
  options?: SearchResultsAdditionalPanels,
  location: 'top' | 'bottom' = 'top'
) => {
  return shallowMount(AdditionalPanels, {
    props: {
      options: options || baseOptions,
      sdkOptions: { environment: 'testing' } as unknown as SdkOptions,
      location
    }
  })
}

const validPanel = (key: string) => ({
  elements: [],
  location: 'top',
  queryKey: key,
  initialCountLimit: 2,
  totalCountLimit: 10,
  labels: {
    showMore: '',
    showLess: ''
  }
})

describe('AdditionalPanels', () => {
  it('should not render component if there are no additional panels configured', () => {
    const wrapper = getComponent({ additionalPanels: [] })
    expect(wrapper.find('.lupa-results-additional-panels').exists()).toBe(false)
  })

  it('should render component if there are additional panels configured', () => {
    const wrapper = getComponent({
      additionalPanels: [validPanel('1') as SearchResultsAdditionalPanelOptions]
    })
    expect(wrapper.find('.lupa-results-additional-panels').exists()).toBe(true)
  })

  it('should not render component if there are no additional panels in components location', () => {
    const wrapper = getComponent(
      {
        additionalPanels: [validPanel('1') as SearchResultsAdditionalPanelOptions]
      },
      'bottom'
    )
    expect(wrapper.find('.lupa-results-additional-panels').exists()).toBe(false)
  })

  it('should render all panels', () => {
    const wrapper = getComponent(
      {
        additionalPanels: [
          validPanel('1'),
          validPanel('2'),
          validPanel('3'),
          validPanel('4')
        ] as SearchResultsAdditionalPanelOptions[]
      },
      'top'
    )
    expect(wrapper.findAllComponents(AdditionalPanel).length).toBe(4)
  })
})
