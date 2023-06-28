/* eslint-disable @typescript-eslint/no-explicit-any */
import { FacetGroupTypeStats, FilterGroupItemTypeRange } from '@getlupa/client-sdk/Types'
import { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import { shallowMount } from '@vue/test-utils'
import StatsFacet from '../StatsFacet.vue'
import { merge } from '@/utils/merger.utils'
import { createTestingPinia } from '@pinia/testing'

const baseFacet: FacetGroupTypeStats = {
  type: 'stats' as unknown as any,
  key: 'price',
  label: 'Price',
  min: 0,
  max: 100
}

const baseOptions: ResultFacetOptions = {
  labels: {
    title: 'Title',
    showAll: 'Show all',
    facetFilter: 'Facet filter',
    facetClear: 'Clear'
  }
}

const getComponent = (
  options?: Partial<ResultFacetOptions>,
  facet?: Partial<FacetGroupTypeStats>,
  currentFilters: FilterGroupItemTypeRange = {}
) => {
  return shallowMount(StatsFacet, {
    global: {
      plugins: [createTestingPinia({})]
    },
    props: {
      options: merge(baseOptions, options ?? {}),
      facet: merge(baseFacet, facet ?? {}),
      currentFilters
    }
  })
}

describe('StatsFacet', () => {
  it('should be rendered', () => {
    const wrapper = getComponent()
    expect(wrapper.find('.lupa-search-result-facet-stats-values').exists()).toBe(true)
  })

  it('should show default stats summary', () => {
    const wrapper = getComponent()
    expect(wrapper.find('.lupa-stats-facet-summary').text()).toEqual('0,00 € - 100,00 €')
  })

  it('should not include currency symbol if facet key does not include price', () => {
    const wrapper = getComponent({}, { key: 'range' })
    expect(wrapper.find('.lupa-stats-facet-summary').text()).toEqual('0 - 100')
  })

  it('should include current filter in summary', () => {
    const wrapper = getComponent({}, {}, { gte: 10, lt: 20 })
    expect(wrapper.find('.lupa-stats-facet-summary').text()).toEqual('10,00 € - 20,00 €')
  })

  it('should not render filter summary if inputs option is set to true', () => {
    const wrapper = getComponent({ stats: { inputs: true } }, { key: 'range' })
    expect(wrapper.find('.lupa-stats-facet-summary').exists()).toBe(false)
  })
})
