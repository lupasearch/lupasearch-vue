import { mount } from '@vue/test-utils'
import SearchBoxHistoryPanel from '../SearchBoxHistoryPanel.vue'
import { SearchBoxHistory } from '@/types/search-box/SearchBoxHistory'
import { createTestingPinia } from '@pinia/testing'
import { useHistoryStore } from '@/stores/history'

const getComponent = async (options: SearchBoxHistory, historyItems?: string[]) => {
  const wrapper = mount(SearchBoxHistoryPanel, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            history: {
              items: historyItems ?? []
            }
          }
        })
      ]
    },
    propsData: {
      options
    }
  })

  await wrapper.vm.$nextTick()
  return wrapper
}

describe('searchBoxHistoryPanel', () => {
  it('should render no history panel if there is no history', async () => {
    const wrapper = await getComponent({
      labels: { clear: 'Clear' }
    })
    expect(wrapper.find('.lupa-search-box-history-panel').exists()).toBe(false)
  })

  it('should render remove all button if there is at least one history item', async () => {
    const wrapper = await getComponent({ labels: { clear: 'Clear' } }, ['one'])
    const clearAll = wrapper.find('.lupa-search-box-history-clear-all')
    expect(clearAll.exists()).toBe(true)
    expect(clearAll.text()).toBe('Clear')
  })

  it('should render all history items', async () => {
    const historyItems = ['one', 'two', 'three']
    const wrapper = await getComponent({ labels: { clear: 'Clear' } }, historyItems)
    const elements = wrapper.findAll('.lupa-search-box-history-item-text')
    expect(elements.length).toBe(3)
    const textValues = elements.map((e) => e.text())
    expect(textValues).toEqual(historyItems)
  })

  it('should remove all items on clear all click', async () => {
    const historyItems = ['one', 'two', 'three']
    const wrapper = await getComponent({ labels: { clear: 'Clear' } }, historyItems)
    const historyStore = useHistoryStore()
    await wrapper.find('.lupa-search-box-history-clear-all').trigger('click')
    expect(historyStore.clear).toHaveBeenCalled()
  })

  it('should remove specific item on click', async () => {
    const historyItems = ['one', 'two', 'three']
    const wrapper = await getComponent({ labels: { clear: 'Clear' } }, historyItems)
    const historyStore = useHistoryStore()
    await wrapper.findAll('.lupa-search-box-history-item-clear')[1].trigger('click')
    expect(historyStore.remove).toHaveBeenCalledWith({
      item: 'two'
    })
  })
})
