import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TRACKING_STORAGE_KEY, TRACKING_STORAGE_KEY_BASE } from '@/constants/global.const'
import { initTracking } from '../tracking.utils'

describe('initTracking', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('should set session key to session storage', () => {
    initTracking({ trackBase: true })
    expect(window.sessionStorage.getItem(TRACKING_STORAGE_KEY_BASE)).toBe('1')
  })

  it('should not set session key to session storage if configuration is not enabled', () => {
    initTracking({ trackBase: false })
    expect(window.sessionStorage.getItem(TRACKING_STORAGE_KEY_BASE)).toBeNull()
  })

  it('should init session tracking', () => {
    vi.mock('@/utils/string.utils', () => ({ getRandomString: vi.fn().mockReturnValue('u123') }))
    initTracking({ trackBase: true, trackSession: true })
    expect(window.sessionStorage.getItem(TRACKING_STORAGE_KEY)).toBe('u123')
  })

  it('should not init session tracking if configuration is not allowed', () => {
    vi.mock('@/utils/string.utils', () => ({ getRandomString: vi.fn().mockReturnValue('123') }))
    initTracking({ trackBase: true, trackSession: false })
    expect(window.sessionStorage.getItem(TRACKING_STORAGE_KEY)).toBeNull()
  })

  it('should not init session tracking if session key already exists', () => {
    vi.mock('@/utils/string.utils', () => ({ getRandomString: vi.fn().mockReturnValue('123') }))
    window.sessionStorage.setItem(TRACKING_STORAGE_KEY, 'existing')
    initTracking({ trackBase: true, trackSession: true })
    expect(window.sessionStorage.getItem(TRACKING_STORAGE_KEY)).toBe('existing')
  })

  it('should init user tracking', () => {
    vi.mock('@/utils/string.utils', () => ({ getRandomString: vi.fn().mockReturnValue('u123') }))
    initTracking({ trackBase: true, trackUser: true })
    expect(window.localStorage.getItem(TRACKING_STORAGE_KEY)).toBe('u123')
  })

  it('should not init user tracking if configuration is not allowed', () => {
    vi.mock('@/utils/string.utils', () => ({ getRandomString: vi.fn().mockReturnValue('u123') }))
    initTracking({ trackBase: true, trackUser: false })
    expect(window.localStorage.getItem(TRACKING_STORAGE_KEY)).toBeNull()
  })

  it('should not init user tracking if session key already exists', () => {
    vi.mock('@/utils/string.utils', () => ({ getRandomString: vi.fn().mockReturnValue('u123') }))
    window.localStorage.setItem(TRACKING_STORAGE_KEY, 'existing')
    initTracking({ trackBase: true, trackUser: true })
    expect(window.localStorage.getItem(TRACKING_STORAGE_KEY)).toBe('existing')
  })

  it('should use configured key instead of generating one', () => {
    vi.mock('@/utils/string.utils', () => ({ getRandomString: vi.fn().mockReturnValue('u123') }))
    initTracking({ trackBase: true, trackUser: true, userKey: 'fixedKey' })
    expect(window.localStorage.getItem(TRACKING_STORAGE_KEY)).toBe('fixedKey')
  })
})
