import { DisplayCondition } from '@/types/DocumentElement'
import { getDynamicAttributes, processDisplayCondition, renderHtmlTemplate } from '../render.utils'

describe('renderHtmlTemplate', () => {
  test('should interpolate values and sanitize output', () => {
    const template = '<h1>{{title}}</h1><script>alert("test")</script>'
    const document = { title: 'Hello, World!' }
    const expectedOutput = '<h1>Hello, World!</h1>'

    const result = renderHtmlTemplate(template, document)
    expect(result).toBe(expectedOutput)
  })

  test('should handle HTML tags in data values', () => {
    const template = '<p>{{content}}</p>'
    const document = { content: '<script>alert("xss")</script>Safe content' }
    const expectedOutput = '<p>&lt;script&gt;alert("xss")&lt;/script&gt;Safe content</p>'

    const result = renderHtmlTemplate(template, document)
    expect(result).toBe(expectedOutput)
  })

  test('should render empty string if template is empty', () => {
    const template = ''
    const document = { title: 'Should not appear' }

    const result = renderHtmlTemplate(template, document)
    expect(result).toBe('')
  })

  test('should return empty template if no data provided', () => {
    const template = '<div>{{unreplaced}}</div>'

    const result = renderHtmlTemplate(template)
    expect(result).toBe('<div></div>')
  })

  test('should sanitize templates without placeholders', () => {
    const template = '<img src="invalid" onerror="alert(\'XSS\')">Hello</br>'
    const expectedOutput = 'Hello<br />'

    const result = renderHtmlTemplate(template)
    expect(result).toBe(expectedOutput)
  })

  it('should replace nested properties', () => {
    const template = '<h1>{{nested.title}}</h1>'
    const document = { nested: { title: 'Nested title' } }
    const expectedOutput = '<h1>Nested title</h1>'

    const result = renderHtmlTemplate(template, document)
    expect(result).toBe(expectedOutput)
  })

  it('should handle nested properties with missing values', () => {
    const template = '<h1>{{nested.title}}</h1>'
    const document = { nested: {} }
    const expectedOutput = '<h1></h1>'

    const result = renderHtmlTemplate(template, document)
    expect(result).toBe(expectedOutput)
  })
})

describe('processDisplayCondition', () => {
  test('should return false if no fields are provided', () => {
    const condition: DisplayCondition = { condition: 'exists', fields: [] }
    const result = processDisplayCondition(condition)
    expect(result).toBe(false)
  })

  test('should return true if all fields exist', () => {
    const condition: DisplayCondition = { condition: 'exists', fields: ['name', 'age'] }
    const doc = { name: 'John', age: 30 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(true)
  })

  test('should return false if not all fields exist', () => {
    const condition: DisplayCondition = { condition: 'exists', fields: ['name', 'location'] }
    const doc = { name: 'John' }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(false)
  })

  test('should return true if two fields are equal', () => {
    const condition: DisplayCondition = { condition: 'equals', fields: ['age1', 'age2'] }
    const doc = { age1: 25, age2: 25 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(true)
  })

  test('should return true if two fields are not equal', () => {
    const condition: DisplayCondition = { condition: 'notEquals', fields: ['age1', 'age2'] }
    const doc = { age1: 25, age2: 30 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(true)
  })

  test('should return true if first field is greater than second field', () => {
    const condition: DisplayCondition = { condition: 'greaterThan', fields: ['age1', 'age2'] }
    const doc = { age1: 30, age2: 25 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(true)
  })

  test('should return true if first field is less than second field', () => {
    const condition: DisplayCondition = { condition: 'lessThan', fields: ['age1', 'age2'] }
    const doc = { age1: 20, age2: 25 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(true)
  })

  test('should return false if first field is not less than second field', () => {
    const condition: DisplayCondition = { condition: 'lessThan', fields: ['age1', 'age2'] }
    const doc = { age1: 25, age2: 20 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(false)
  })

  test('should return true if first field is greater than or equal to second field', () => {
    const condition: DisplayCondition = {
      condition: 'greaterThanOrEquals',
      fields: ['age1', 'age2']
    }
    const doc = { age1: 25, age2: 25 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(true)
  })

  test('should return true if first field is less than or equal to second field', () => {
    const condition: DisplayCondition = { condition: 'lessThanOrEquals', fields: ['age1', 'age2'] }
    const doc = { age1: 25, age2: 30 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(true)
  })

  test('should return false for unsupported condition', () => {
    const condition: DisplayCondition = { condition: 'unknown', fields: ['age1', 'age2'] } as any
    const doc = { age1: 25, age2: 30 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(false)
  })

  it("should handle nested fields in condition's fields", () => {
    const condition: DisplayCondition = {
      condition: 'equals',
      fields: ['nested.age1', 'nested.age2']
    }
    const doc = { nested: { age1: 25, age2: 25 } }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(true)
  })

  it("should ignore all other fields after the first two fields in the condition's fields", () => {
    const condition: DisplayCondition = {
      condition: 'equals',
      fields: ['age1', 'age2', 'age3']
    }
    const doc = { age1: 25, age2: 25, age3: 25 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(true)
  })

  it("should not return true if nested fields don't exist", () => {
    const condition: DisplayCondition = {
      condition: 'equals',
      fields: ['nested.age1', 'nested.age2']
    }
    const doc = { nested: { age1: 25 } }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(false)
  })

  it('should work with literal numerical values in fields', () => {
    const condition: DisplayCondition = {
      condition: 'greaterThan',
      fields: [25, 20]
    }
    const result = processDisplayCondition(condition)
    expect(result).toBe(true)
  })

  it('should work with literal numerical values combined with field values', () => {
    const condition: DisplayCondition = {
      condition: 'greaterThan',
      fields: ['age', 25]
    }
    const doc = { age: 20 }
    const result = processDisplayCondition(condition, doc)
    expect(result).toBe(false)
  })

  it('should return false if there are no fields defined', () => {
    const condition: DisplayCondition = { condition: 'exists' } as any
    const result = processDisplayCondition(condition)
    expect(result).toBe(false)
  })
})

describe('getDynamicAttributes', () => {
  test('should return empty object if no dynamicAttributes are provided', () => {
    const result = getDynamicAttributes()
    expect(result).toEqual({})
  })

  test('should return empty object if dynamicAttributes is empty', () => {
    const result = getDynamicAttributes([])
    expect(result).toEqual({})
  })

  test('should ignore attributes whose key does not start with "data-"', () => {
    const dynamicAttributes = [
      { key: 'class', value: 'my-class' },
      { key: 'id', value: 'my-id' }
    ]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({})
  })

  test('should process attributes whose key starts with "data-"', () => {
    const dynamicAttributes = [
      { key: 'data-custom', value: 'custom value' },
      { key: 'data-another', value: 'another value' }
    ]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-custom': 'custom value',
      'data-another': 'another value'
    })
  })

  test('should render attribute values using Mustache and document data', () => {
    const dynamicAttributes = [{ key: 'data-greeting', value: 'Hello, {{name}}!' }]
    const document = { name: 'Alice' }
    const result = getDynamicAttributes(dynamicAttributes, document)
    expect(result).toEqual({
      'data-greeting': 'Hello, Alice!'
    })
  })

  test('should escape HTML in rendered values', () => {
    const dynamicAttributes = [{ key: 'data-unsafe', value: '<script>alert("XSS")</script>' }]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-unsafe': '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
    })
  })

  test('should handle nested properties in document', () => {
    const dynamicAttributes = [
      { key: 'data-fullname', value: '{{user.firstName}} {{user.lastName}}' }
    ]
    const document = { user: { firstName: 'John', lastName: 'Doe' } }
    const result = getDynamicAttributes(dynamicAttributes, document)
    expect(result).toEqual({
      'data-fullname': 'John Doe'
    })
  })

  test('should handle missing properties gracefully', () => {
    const dynamicAttributes = [{ key: 'data-unknown', value: '{{unknownProperty}}' }]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-unknown': ''
    })
  })

  test('should handle null or undefined values', () => {
    const dynamicAttributes = [
      { key: 'data-null', value: null },
      { key: 'data-undefined', value: undefined }
    ]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-null': '',
      'data-undefined': ''
    })
  })

  test('should handle empty string values', () => {
    const dynamicAttributes = [{ key: 'data-empty', value: '' }]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-empty': ''
    })
  })

  test('should handle arrays in document data', () => {
    const dynamicAttributes = [{ key: 'data-items', value: '{{#items}}{{.}},{{/items}}' }]
    const document = { items: ['a', 'b', 'c'] }
    const result = getDynamicAttributes(dynamicAttributes, document)
    expect(result).toEqual({
      'data-items': 'a,b,c,'
    })
  })

  test('should continue processing other attributes even if one fails', () => {
    const dynamicAttributes = [
      { key: 'data-valid', value: 'Valid' },
      { key: null, value: 'Invalid' },
      { key: 'data-also-valid', value: 'Also valid' }
    ]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-valid': 'Valid',
      'data-also-valid': 'Also valid'
    })
  })

  test('should ignore attributes with null or undefined keys', () => {
    const dynamicAttributes = [
      { key: null, value: 'Null key' },
      { key: undefined, value: 'Undefined key' },
      { key: 'data-valid', value: 'Valid key' }
    ]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-valid': 'Valid key'
    })
  })

  test('should handle keys that start with "data-" but have uppercase letters', () => {
    const dynamicAttributes = [{ key: 'data-Custom', value: 'Custom value' }]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-Custom': 'Custom value'
    })
  })

  test('should not modify the original dynamicAttributes array', () => {
    const dynamicAttributes = [{ key: 'data-original', value: 'Original value' }]
    const originalDynamicAttributes = JSON.parse(JSON.stringify(dynamicAttributes))
    getDynamicAttributes(dynamicAttributes)
    expect(dynamicAttributes).toEqual(originalDynamicAttributes)
  })

  test('should not throw error if dynamicAttributes contains invalid entries', () => {
    const dynamicAttributes = [
      null,
      { key: 'data-valid', value: 'Valid' },
      undefined,
      { key: 'not-data', value: 'Not data' }
    ]
    expect(() => getDynamicAttributes(dynamicAttributes)).not.toThrow()
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-valid': 'Valid'
    })
  })

  test('should process attributes with key starting with "data-" with additional dashes', () => {
    const dynamicAttributes = [{ key: 'data-custom-attribute', value: 'Custom Attribute' }]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-custom-attribute': 'Custom Attribute'
    })
  })

  test('should escape HTML in rendered values with Mustache variables', () => {
    const dynamicAttributes = [{ key: 'data-unsafe', value: '{{unsafe}}' }]
    const document = { unsafe: '<script>alert("XSS")</script>' }
    const result = getDynamicAttributes(dynamicAttributes, document)
    expect(result).toEqual({
      'data-unsafe': '&amp;lt;script&amp;gt;alert(&amp;quot;XSS&amp;quot;)&amp;lt;&amp;#x2F;script&amp;gt;'
    })
  })

  test('should handle multiple attributes', () => {
    const dynamicAttributes = [
      { key: 'data-first', value: 'First' },
      { key: 'data-second', value: 'Second' },
      { key: 'data-third', value: 'Third' }
    ]
    const result = getDynamicAttributes(dynamicAttributes)
    expect(result).toEqual({
      'data-first': 'First',
      'data-second': 'Second',
      'data-third': 'Third'
    })
  })

  test("should handle nested properties in document's dynamic attributes", () => {
    const dynamicAttributes = [
      { key: 'data-fullname', value: '{{user.firstName}} {{user.lastName}}' }
    ]
    const document = { user: { firstName: 'John', lastName: 'Doe' } }
    const result = getDynamicAttributes(dynamicAttributes, document)
    expect(result).toEqual({
      'data-fullname': 'John Doe'
    })
  })
})
