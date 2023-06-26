import { addParamsToLabel } from './string.utils'

export const setDocumentTitle = (template: string, textToInsert = ''): void => {
  document.title = addParamsToLabel(template, textToInsert)
}
