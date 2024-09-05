export type ExtractFrom = 'url' | 'localStorage' | 'sessionStorage' | 'htmlElementText'

export type BaseExtractFrom = {
  extractFrom: ExtractFrom
  default: string | number | Record<string, unknown>
}

export type ExtractFromUrl = BaseExtractFrom & {
  extractFrom: 'url'
  regex: string
}

export type ExtractFromStorage = BaseExtractFrom & {
  extractFrom: 'localStorage' | 'sessionStorage'
  key: string
  path?: string
}

export type ExtractFromHtmlElementText = BaseExtractFrom & {
  extractFrom: 'htmlElementText'
  querySelector: string
}

export type DataExtraction = ExtractFromUrl | ExtractFromStorage | ExtractFromHtmlElementText
