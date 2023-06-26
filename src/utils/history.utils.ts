import { HISTORY_LOCAL_STORAGE_KEY, HISTORY_MAX_ITEMS } from '@/constants/global.const'

export const retrieveHistory = (): string[] => {
  try {
    const historyString = window.localStorage.getItem(HISTORY_LOCAL_STORAGE_KEY)
    return historyString ? JSON.parse(historyString) : []
  } catch (e) {
    // Local storage might be disabled by user
    return []
  }
}

export const saveHistory = (items: string[]): void => {
  try {
    window.localStorage.setItem(
      HISTORY_LOCAL_STORAGE_KEY,
      JSON.stringify(items.slice(0, HISTORY_MAX_ITEMS))
    )
  } catch {
    // Local storage might be disabled by user
  }
}
