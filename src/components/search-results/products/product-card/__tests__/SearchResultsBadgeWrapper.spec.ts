/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadgeType } from '@/types/search-results/BadgeOptions'
import { mount, VueWrapper } from '@vue/test-utils'
import SearchResultsBadgeWrapper from '../badges/SearchResultsBadgeWrapper.vue'
import CustomBadge from '../badges/CustomBadge.vue'
import TextBadge from '../badges/TextBadge.vue'
import ImageBadge from '../badges/ImageBadge.vue'

describe('SearchResultsBadgeWrapper', () => {
  let wrapper: VueWrapper
  let wrapperVm: any

  const product = {
    name: 'test',
    textLabels: ['10', '20'],
    imageLabels: ['20.png'],
    newItemKey: 'NEW'
  }

  beforeEach(() => {
    wrapper = mount(SearchResultsBadgeWrapper, {
      props: {
        options: {
          anchor: 'tr',
          elements: [
            {
              type: 'text',
              key: 'textLabels'
            },
            {
              type: 'image',
              key: 'imageLabels'
            },
            {
              type: 'customHtml',
              key: 'customBadgeKey',
              html: () => '<strong>Custom</strong>'
            }
          ],
          product
        }
      }
    })
    wrapperVm = wrapper.vm as any
  })

  it('should return badges with correct values', () => {
    expect(wrapperVm.badges).toEqual([
      {
        type: 'text',
        key: 'textLabels',
        value: ['10', '20'],
        product
      },
      {
        type: 'image',
        key: 'imageLabels',
        value: ['20.png'],
        product
      },
      {
        type: 'customHtml',
        html: expect.any(Function),
        key: 'customBadgeKey',
        value: 'badge',
        product
      }
    ])
  })

  it('should return correct badge component', () => {
    for (const type in BadgeType) {
      switch (type) {
        case BadgeType.TEXT:
          expect(wrapperVm.getBadgeComponent(type)).toBe('TextBadge')
          break
        case BadgeType.IMAGE:
          expect(wrapperVm.getBadgeComponent(type)).toBe('ImageBadge')
          break
        case BadgeType.CUSTOM_HTML:
          expect(wrapperVm.getBadgeComponent(type)).toBe('CustomBadge')
          break
        default:
          break
      }
    }
    expect(wrapperVm.getBadgeComponent('CustomBadge123')).toBe('CustomBadge')
  })

  it('should have a correct class', () => {
    expect(wrapper.find('.tr').exists).toBeTruthy()
  })

  it('should display all supplied badge elements', () => {
    expect(wrapper.findComponent(TextBadge).exists).toBeTruthy()
    expect(wrapper.findComponent(ImageBadge).exists).toBeTruthy()
    expect(wrapper.findComponent(CustomBadge).exists).toBeTruthy()
  })
})
