/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import { FacetResult } from '@getlupa/client-sdk/Types'
import { shallowMount } from '@vue/test-utils'
import FacetList from '../FacetList.vue'
import FacetDisplay from '../FacetDisplay.vue'

const baseOptions: ResultFacetOptions = {
  labels: {
    title: 'Title',
    showAll: 'Show all',
    facetFilter: 'Facet filter'
  }
}

const getComponent = (facets: FacetResult[] = []) => {
  return shallowMount(FacetList, {
    props: {
      options: baseOptions,
      facets
    }
  })
}

describe('FacetList', () => {
  it('should render section title', () => {
    const wrapper = getComponent()
    expect(wrapper.find('.lupa-search-result-facet-section .lupa-facets-title').text()).toBe(
      'Title'
    )
  })

  it('should render a given number of facets', () => {
    const wrapper = getComponent([
      { key: '1', type: 'terms' as unknown as any, items: [], label: 'Terms1' },
      { key: '2', type: 'terms' as unknown as any, items: [], label: 'Terms2' }
    ])
    const items = wrapper.findAllComponents(FacetDisplay)
    expect(items.length).toBe(2)
  })
})
