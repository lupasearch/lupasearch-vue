/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FacetGroupHierarchy,
  FacetGroupItemTypeHierarchy,
  FilterGroupItemTypeHierarchy
} from '@getlupa/client-sdk/Types'
import { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import { mount } from '@vue/test-utils'
import HierarchyFacet from '../HierarchyFacet.vue'
import { merge } from '@/utils/merger.utils'

const baseFacet: FacetGroupHierarchy = {
  type: 'stats' as unknown as any,
  key: 'price',
  label: 'Price',
  items: [
    {
      title: 'one',
      key: 'one',
      count: 1
    },
    {
      title: 'two',
      key: 'two',
      count: 1,
      children: [
        {
          title: 'two-two',
          key: 'two-2',
          count: 1,
          children: [
            {
              title: 'two-three',
              key: 'two-3',
              count: 1
            }
          ]
        }
      ]
    },
    {
      title: 'three',
      key: 'three',
      count: 1
    },
    {
      title: 'four',
      key: 'four',
      count: 1
    }
  ]
}

const baseOptions: ResultFacetOptions = {
  labels: {
    title: 'Title',
    showAll: 'Show all',
    facetFilter: 'Facet filter'
  }
}

const getComponent = (
  options?: Partial<ResultFacetOptions>,
  facet?: Partial<FacetGroupItemTypeHierarchy>,
  currentFilters: FilterGroupItemTypeHierarchy = { terms: [] }
) => {
  return mount(HierarchyFacet, {
    propsData: {
      options: merge(baseOptions, options ?? {}),
      facet: merge(baseFacet, facet ?? {}),
      currentFilters
    }
  })
}

describe('hierarchyFacet', () => {
  it('should be rendered', () => {
    const wrapper = getComponent()
    expect(wrapper.find('.lupa-search-result-facet-term-values').exists()).toBe(true)
  })

  it('should display top level value', () => {
    const wrapper = getComponent()
    expect(wrapper.find('.lupa-facet-hierarchy').text()).toBe('one')
  })

  it('should display count if show doc count is configured', () => {
    const wrapper = getComponent({ showDocumentCount: true })
    expect(wrapper.find('.lupa-facet-hierarchy').text()).toBe('one (1)')
  })

  it('should display multi level value', () => {
    const wrapper = getComponent()
    expect(wrapper.find('.lupa-facet-hierarchy .lupa-facet-hierarchy').text()).toBe('two-two')
  })

  it('should have a checked value if facet key is in current filters', () => {
    const wrapper = getComponent({}, {}, { terms: ['three', 'two-2'] })
    const facets = wrapper.findAll('.lupa-facet-term')
    const facet0 = facets.at(0)
    expect(facet0.text()).toBe('one')
    expect(facet0.find('.lupa-term-checkbox').classes().includes('checked')).toBe(false)
    const facet5 = facets.at(4)
    expect(facet5.text()).toBe('three')
    expect(facet5.find('.lupa-term-checkbox').classes().includes('checked')).toBe(true)

    const facet2 = facets.at(2)
    expect(facet2.text()).toBe('two-two')
    expect(facet2.find('.lupa-term-checkbox').classes().includes('checked')).toBe(true)
  })

  it('should emit select event on click', () => {
    const wrapper = getComponent()
    wrapper.find('.lupa-term-checkbox').trigger('click')
    expect(wrapper.emitted().select).toEqual([
      [{ key: 'price', type: 'hierarchy', value: 'one', behavior: 'append' }]
    ])
  })
})
