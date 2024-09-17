import { describe, expect, it } from 'vitest'
import { generateGridTemplate } from '../grid.utils'

describe('generateGridTemplate', () => {
  it('should generate correct grid template for balanced left and right elements', () => {
    const elements = [
      { gridArea: 'left' },
      { gridArea: 'right' },
      { gridArea: 'left' },
      { gridArea: 'right' }
    ]

    const result = generateGridTemplate(elements)
    expect(result).toBe('"left0 right1" "left2 right3"')
  })

  it('should handle more left elements than right elements', () => {
    const elements = [
      { gridArea: 'left' },
      { gridArea: 'left' },
      { gridArea: 'left' },
      { gridArea: 'right' }
    ]

    const result = generateGridTemplate(elements)
    expect(result).toBe('"left0 right3" "left1 right3" "left2 right3"')
  })

  it('should handle more right elements than left elements', () => {
    const elements = [
      { gridArea: 'left' },
      { gridArea: 'right' },
      { gridArea: 'right' },
      { gridArea: 'right' }
    ]

    const result = generateGridTemplate(elements)
    expect(result).toBe('"left0 right1" "left0 right2" "left0 right3"')
  })

  it('should handle only left elements', () => {
    const elements = [{ gridArea: 'left' }, { gridArea: 'left' }]

    const result = generateGridTemplate(elements)
    expect(result).toBe('"left0 left0" "left1 left1"')
  })

  it('should handle only right elements', () => {
    const elements = [{ gridArea: 'right' }, { gridArea: 'right' }]

    const result = generateGridTemplate(elements)
    expect(result).toBe('"right0 right0" "right1 right1"')
  })

  it('should handle empty elements array', () => {
    const elements = []

    const result = generateGridTemplate(elements)
    expect(result).toBeUndefined()
  })

  it('should handle single left element', () => {
    const elements = [{ index: 0, gridArea: 'left' }]

    const result = generateGridTemplate(elements)
    expect(result).toBe('"left0 left0"')
  })

  it('should handle single right element', () => {
    const elements = [{ index: 0, gridArea: 'right' }]

    const result = generateGridTemplate(elements)
    expect(result).toBe('"right0 right0"')
  })

  it('should handle non-sequential indexes', () => {
    const elements = [{ gridArea: 'left' }, { gridArea: 'right' }, { gridArea: 'right' }]

    const result = generateGridTemplate(elements)
    expect(result).toBe('"left0 right1" "left0 right2"')
  })

  it('should return no template if some values are not valid', () => {
    const elements = [{ gridArea: 'center' }, { gridArea: 'right' }]
    const result = generateGridTemplate(elements)
    expect(result).toBeUndefined()
  })
})
