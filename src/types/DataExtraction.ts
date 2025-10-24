export type ExtractFrom =
  | 'url'
  | 'localStorage'
  | 'sessionStorage'
  | 'htmlElementText'
  | 'htmlElementAttribute'
  | 'cookie'

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

export type ExtractFromHtmlElementAttribute = BaseExtractFrom & {
  extractFrom: 'htmlElementAttribute'
  querySelector: string
  attribute: string
  regex?: string
}

export type ExtractFromCookie = BaseExtractFrom & {
  extractFrom: 'cookie'
  cookieName: string
}

export type DataExtraction =
  | ExtractFromUrl
  | ExtractFromStorage
  | ExtractFromHtmlElementText
  | ExtractFromHtmlElementAttribute
  | ExtractFromCookie
