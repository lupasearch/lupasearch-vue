import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { retrieveHistory, saveHistory } from '@/utils/history.utils'

export const useHistoryStore = defineStore('history', () => {
  const items = ref(retrieveHistory())

  const count = computed(() => items.value.length)

  const add = ({ item }: { item?: string }): string[] => {
    if (!item) {
      return items.value
    }
    const newItems = items.value ? [item, ...items.value] : [item]
    const uniqueItems = Array.from(new Set(newItems))
    items.value = uniqueItems
    saveHistory(uniqueItems)
    return uniqueItems
  }

  const remove = ({ item }: { item: string }): string[] => {
    const tempItems = items.value?.filter((i) => i !== item) ?? []
    saveHistory(tempItems)
    items.value = tempItems
    return tempItems
  }

  const clear = (): void => {
    saveHistory([])
    items.value = []
  }

  return { items, count, add, remove, clear }
})
