/* eslint-disable @typescript-eslint/no-explicit-any */
const isObject = (item: Record<string, unknown>) => typeof item === 'object' && !Array.isArray(item)

// Modified version of https://stackoverflow.com/a/53092443
export const merge = <A extends Record<string, any>, B extends Record<string, any>>(
  target: A,
  source: B
): A & B => {
  const isDeep = (prop: string) =>
    isObject(source[prop]) &&
    Object.prototype.hasOwnProperty.call(target, prop) &&
    isObject(target[prop])
  const replaced = Object.getOwnPropertyNames(source)
    .map((prop) => ({
      [prop]: isDeep(prop) ? merge(target[prop], source[prop]) : source[prop]
    }))
    .reduce((a, b) => ({ ...a, ...b }), {})

  return {
    ...(target as Record<string, unknown>),
    ...(replaced as Record<string, unknown>)
  } as A & B
}
