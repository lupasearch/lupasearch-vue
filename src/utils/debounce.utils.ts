export const debounce = (
  func: (...args: any[]) => any,
  timeout = 300
): ((...args: any[]) => void) => {
  let timer: any
  return (...args: any[]): void => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, timeout)
  }
}
