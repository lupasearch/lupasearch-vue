export const joinUrlParts = (...parts: string[]) => {
  return (
    parts
      ?.map((part) => part.replace(/(^\/+|\/+$)/g, ''))
      ?.filter((part) => part !== '')
      ?.join('/') ?? ''
  )
}
