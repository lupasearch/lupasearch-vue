import sanitizeHtml from 'sanitize-html'
import Mustache from 'mustache'
import { DisplayCondition, DynamicAttribute } from '@/types/DocumentElement'
import { escapeHtml } from './string.utils'

export const renderHtmlTemplate = (
  template: string,
  document: Record<string, unknown> = {}
): string => {
  const rendered = Mustache.render(template, document)
  return sanitizeHtml(rendered)
}

export const getDynamicAttributes = (
  dynamicAttributes: DynamicAttribute[] = [],
  document: Record<string, unknown> = {}
) => {
  const parsedAttributes = {}
  for (const attribute of dynamicAttributes) {
    if (!attribute?.key?.startsWith('data-')) {
      continue // Only data- attributes are supported
    }
    parsedAttributes[attribute?.key] = escapeHtml(Mustache.render(attribute?.value ?? '', document))
  }
  return parsedAttributes
}

const getFieldValue = (doc: Record<string, any>, field: string | number = '') => {
  if (typeof field === 'number') {
    return +field // Literal numeric value
  }
  const value = field?.split('.')?.reduce((obj, key) => (obj ? obj[key] : undefined), doc)
  if (+value) {
    return +value
  }
  return value
}

export const processDisplayCondition = (
  displayCondition: DisplayCondition,
  doc: Record<string, unknown> = {}
): boolean => {
  const { condition, fields } = displayCondition

  if (!fields?.length) {
    return false // No fields to check
  }

  switch (condition) {
    case 'exists': {
      // Check if all fields exist in the document
      return fields?.every((field) => getFieldValue(doc, field) !== undefined)
    }
    case 'equals': {
      if (fields.length < 2) return false // At least two fields needed for comparison
      const [field1, field2] = fields
      return getFieldValue(doc, field1) === getFieldValue(doc, field2)
    }
    case 'notEquals': {
      if (fields.length < 2) return false
      const [field1, field2] = fields
      return getFieldValue(doc, field1) !== getFieldValue(doc, field2)
    }
    case 'greaterThan': {
      if (fields.length < 2) return false
      const [field1, field2] = fields
      return getFieldValue(doc, field1) > getFieldValue(doc, field2)
    }
    case 'lessThan': {
      if (fields.length < 2) return false
      const [field1, field2] = fields
      return getFieldValue(doc, field1) < getFieldValue(doc, field2)
    }
    case 'greaterThanOrEquals': {
      if (fields.length < 2) return false
      const [field1, field2] = fields
      return getFieldValue(doc, field1) >= getFieldValue(doc, field2)
    }
    case 'lessThanOrEquals': {
      if (fields.length < 2) return false
      const [field1, field2] = fields
      return getFieldValue(doc, field1) <= getFieldValue(doc, field2)
    }
    default:
      return false // Unsupported condition
  }
}
