import { Document } from '@getlupa/client-sdk/Types'
import { shallowMount } from '@vue/test-utils'
import SearchResultsProductCustomHtmlElement from '../custom/SearchResultsProductCustomHtmlElement.vue'
import { CustomHtmlElement, DocumentElementType } from '@/types/DocumentElement'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'

describe('SearchResultsProductCustomHtmlElement.vue', () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia())
  })

  it('should render item text as html string', () => {
    const wrapper = shallowMount(SearchResultsProductCustomHtmlElement, {
      propsData: {
        options: {
          className: 'custom-class',
          type: DocumentElementType.CUSTOM_HTML,
          html: (doc: Document) =>
            `
              <a href='/'>Create account</a>
              <span>to save ${doc['discount']} € (${doc['discountPercentages']})</span>
            `
        } as CustomHtmlElement,
        item: { discount: '5', discountPercentages: '15%' }
      }
    })
    const element = wrapper.find('.custom-class')
    expect(element.find('a').text()).toEqual('Create account')
    expect(element.find('span').text()).toEqual('to save 5 € (15%)')
  })

  it('should render empty string if property is empty', () => {
    const wrapper = shallowMount(SearchResultsProductCustomHtmlElement, {
      propsData: {
        options: {
          html: () => '',
          className: 'custom-class',
          type: DocumentElementType.CUSTOM_HTML
        },
        item: { name: '<div>Product title</div>' }
      }
    })
    const element = wrapper.find('.custom-class')
    expect(element.text()).toEqual('')
  })

  const XSS = '<img src=x onerror="alert(1)">'

  const mountWith = ({
    html,
    item,
    useRawHtml,
    autoEscapeDocumentData
  }: {
    html: CustomHtmlElement['html']
    item: Document
    useRawHtml?: boolean
    autoEscapeDocumentData?: boolean
  }) =>
    shallowMount(SearchResultsProductCustomHtmlElement, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { options: { searchResultOptions: { autoEscapeDocumentData } } }
          })
        ]
      },
      propsData: {
        options: {
          className: 'custom-class',
          type: DocumentElementType.CUSTOM_HTML,
          html,
          useRawHtml
        } as CustomHtmlElement,
        item
      }
    })

  describe('autoEscapeDocumentData rendering', () => {
    const html = (doc: Document) => `<span>${doc['name']}</span>`

    it('renders raw feed html when the option is off', () => {
      const wrapper = mountWith({ html, item: { name: XSS }, autoEscapeDocumentData: false })
      expect(wrapper.find('img').exists()).toBe(true)
    })

    it('escapes feed html when the option is on', () => {
      const wrapper = mountWith({ html, item: { name: XSS }, autoEscapeDocumentData: true })
      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.text()).toContain('<img src=x')
    })

    it('renders raw feed html when useRawHtml is set, even with the option on', () => {
      const wrapper = mountWith({
        html,
        item: { name: XSS },
        useRawHtml: true,
        autoEscapeDocumentData: true
      })
      expect(wrapper.find('img').exists()).toBe(true)
    })

    it('keeps rawDocument (second arg) unescaped as an explicit opt-in', () => {
      const rawHtml = (_doc: Document, rawDoc: Document) => `<span>${rawDoc['name']}</span>`
      const wrapper = mountWith({ html: rawHtml, item: { name: XSS }, autoEscapeDocumentData: true })
      expect(wrapper.find('img').exists()).toBe(true)
    })
  })
})
