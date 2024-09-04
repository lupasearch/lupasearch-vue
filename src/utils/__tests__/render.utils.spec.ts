import { DisplayCondition } from '@/types/DocumentElement'
import { processDisplayCondition, renderHtmlTemplate } from '../render.utils'

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
})
