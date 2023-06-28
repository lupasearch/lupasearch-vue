import { describe, expect, it, vi, beforeEach } from 'vitest'
import { HISTORY_LOCAL_STORAGE_KEY, HISTORY_MAX_ITEMS } from '@/constants/global.const'
import { retrieveHistory, saveHistory } from '../history.utils'

describe('retrieveHistory', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('should return items saved in a local storage', () => {
    window.localStorage.setItem(HISTORY_LOCAL_STORAGE_KEY, JSON.stringify(['book', 'tv']))
    const history = retrieveHistory()
    expect(history).toEqual(['book', 'tv'])
  })

  it('should return empty array if there are no items saved', () => {
    window.localStorage.clear()
    const history = retrieveHistory()
    expect(history).toEqual([])
  })

  it('should return empty array if saved items cannot be parsed', () => {
    window.localStorage.setItem(HISTORY_LOCAL_STORAGE_KEY, "['book, 'stuff']")
    const history = retrieveHistory()
    expect(history).toEqual([])
  })
})

describe('saveHistory', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('should save item array in a local storage', () => {
    saveHistory(['a', 'b', 'c'])
    expect(window.localStorage.getItem(HISTORY_LOCAL_STORAGE_KEY)).toBe(`["a","b","c"]`)
  })

  it('should save empty item array in a local storage', () => {
    saveHistory([])
    expect(window.localStorage.getItem(HISTORY_LOCAL_STORAGE_KEY)).toBe(`[]`)
  })

  it('should limit a number of saved items', () => {
    saveHistory(Array.from(Array(HISTORY_MAX_ITEMS + 5).keys()) as unknown as string[])
    expect(window.localStorage.getItem(HISTORY_LOCAL_STORAGE_KEY)).toBe(`[0,1,2,3,4,5,6]`)
  })
})
