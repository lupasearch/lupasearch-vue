export const generateGridTemplate = (elements: { gridArea?: string }[]) => {
  const indexedElements = elements.map((el, index) => ({ ...el, index }))
  if (
    !indexedElements.length ||
    !indexedElements.every((el) => el.gridArea === 'left' || el.gridArea === 'right')
  ) {
    return undefined
  }

  let leftElements = indexedElements.filter((el) => el.gridArea === 'left')
  let rightElements = indexedElements.filter((el) => el.gridArea === 'right')

  // Handle empty sides
  if (!leftElements.length && !rightElements.length) {
    return ''
  } else if (!leftElements.length) {
    leftElements = rightElements
  } else if (!rightElements.length) {
    rightElements = leftElements
  }

  const totalRows = Math.max(leftElements.length, rightElements.length)

  const gridTemplate = []

  for (let row = 0; row < totalRows; row++) {
    const leftIndex = row < leftElements.length ? row : leftElements.length - 1
    const rightIndex = row < rightElements.length ? row : rightElements.length - 1

    const leftElement = leftElements[leftIndex]
    const rightElement = rightElements[rightIndex]

    const leftColumn = `${leftElement.gridArea}${leftElement.index}`
    const rightColumn = `${rightElement.gridArea}${rightElement.index}`

    const gridRow = `${leftColumn} ${rightColumn}`

    gridTemplate.push(`"${gridRow}"`)
  }

  return gridTemplate.join(' ')
}
