export const debounce = (
  func: (...args: any[]) => any,
  timeout?: number
): ((...args: any[]) => void) => {
  if (!timeout) {
    return (...args: unknown[]) => {
      func(args)
    }
  }
  let timer: any
  return (...args: any[]): void => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, timeout)
  }
}
