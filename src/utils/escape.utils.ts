import { escapeRawHtml } from './string.utils'

// Deep-escapes every string value in a document copy so feed data is safe when
// passed to client html functions; originals stay untouched (see rawDocument arg).
export const escapeDocumentValues = <T>(value: T): T => {
  if (typeof value === 'string') {
    return escapeRawHtml(value) as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => escapeDocumentValues(item)) as unknown as T
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>)) {
      result[key] = escapeDocumentValues((value as Record<string, unknown>)[key])
    }
    return result as T
  }
  return value
}
