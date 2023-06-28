import { mount, VueWrapper } from '@vue/test-utils'
import SearchResultsBreadcrumbs from '../SearchResultsBreadcrumbs.vue'
import { createTestingPinia } from '@pinia/testing'

describe('SearchResultsBreadcrumbs', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(SearchResultsBreadcrumbs, {
      global: {
        plugins: [createTestingPinia({})]
      },
      props: {
        breadcrumbs: [{ label: 'Titulinis', link: '/' }, { label: 'Ieškoti rezultatų: {1}' }]
      }
    })
  })

  it('should display correct breadcrumbs', () => {
    const link = wrapper.find('.lupa-search-results-breadcrumb-link')
    expect(link.text()).toEqual('Titulinis')
    expect(link.attributes().href).toBe('/')

    expect(wrapper.find('.lupa-search-results-breadcrumb-text').text()).toEqual(
      "Ieškoti rezultatų: 'undefined'"
    )
  })
})
