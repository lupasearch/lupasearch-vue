import { describe, expect, it, vi } from 'vitest'

import { debounce } from '../debounce.utils'

describe('debounce', () => {
  it('should call function after given timeout', async () => {
    const timeout = 10
    const fn = vi.fn()
    const debouncedFn = debounce(fn, timeout)
    debouncedFn()
    expect(fn).not.toHaveBeenCalled()
    await new Promise((resolve) => setTimeout(resolve, timeout + 5))
    expect(fn).toHaveBeenCalled()
  })

  it('should call function immediately if debounce timeout is undefined', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, undefined)
    debouncedFn()
    await new Promise((resolve) => setTimeout(resolve, 1))

    expect(fn).toHaveBeenCalled()
  })
})
