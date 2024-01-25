export const joinUrlParts = (...parts: string[]) => {
  if (parts.length === 1) {
    return `${parts[0]}`
  }
  return (
    parts
      ?.map((part) => part.replace(/(^\/+|\/+$)/g, ''))
      ?.filter((part) => part !== '')
      ?.join('/') ?? ''
  )
}
