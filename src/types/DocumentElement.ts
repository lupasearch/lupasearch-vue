/* eslint-disable @typescript-eslint/no-explicit-any */
export enum DocumentElementType {
  IMAGE = 'image',
  TITLE = 'title',
  CUSTOM = 'custom',
  DESCRIPTION = 'description',
  PRICE = 'price',
  REGULARPRICE = 'regularPrice',
  RATING = 'rating',
  SINGLE_STAR_RATING = 'singleStarRating',
  ADDTOCART = 'addToCart',
  CUSTOM_HTML = 'customHtml'
}

export type DisplayOption<T = any> =
  | DisplayCondition
  | DisplayCondition[]
  | ((document: T) => boolean)

export type DisplayCondition = {
  condition:
    | 'exists'
    | 'notExists'
    | 'equals'
    | 'notEquals'
    | 'greaterThan'
    | 'lessThan'
    | 'greaterThanOrEquals'
    | 'lessThanOrEquals'
  fields: (string | number)[]
}

export type DynamicAttribute = {
  key: string
  value: string
}

export type DocumentElementBase<T = any> = {
  type: DocumentElementType
  key?: string
  display?: DisplayOption<T>
  isHtml?: boolean
  group?: string
  dynamic?: boolean
  dynamicAttributes?: DynamicAttribute[]
  className: string
}

export type ImageDocumentElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.IMAGE
  placeholder: string
  baseUrl?: string
  key: string
  customUrl?: (document: T) => string
  alt?: (document: T) => string
  dimensions?: {
    width?: number
    height?: number
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  }
  hoverImages?: {
    key?: string
    display?: (document: T) => string[]
    cycleInterval?: number
    maxImages?: number
  }
}

export type TitleDocumentElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.TITLE
  maxLines?: number
  link?: boolean
  key: string
}

export type DescriptionDocumentElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.DESCRIPTION
  maxLines?: number
  key: string
}

export type CustomDocumentElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.CUSTOM
  maxLines?: number
  key: string
  label?: string
  stopPropagationOnClick?: boolean
  action?: (document: T) => Promise<unknown> | undefined
}

export type PriceElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.PRICE
  key: string
}

export type RegularPriceDocumentElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.REGULARPRICE
  key: string
}

export type RatingElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.RATING
  labels: RatingLabels
  links?: RatingLinks
  totalKey: string
  getRatingPercentage?: (doc: T) => number
  maxRating?: number
  key: string
}

export type SingleStarRatingElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.SINGLE_STAR_RATING
  labels: RatingLabels
  links: RatingLinks
  key: string
  totalKey: string
  displayRating: (doc: T) => string
}

export type RatingLabels = {
  numberOfRatings: string
}

export type RatingLinks = {
  ratingDetails?: string
}

export type AddToCartElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.ADDTOCART
  action: (document: T, amount: number) => Promise<unknown> | undefined
  emitEvent: string
  link?: boolean
  labels: {
    addToCart: string
  }
}

export type CustomHtmlElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.CUSTOM_HTML
  html: string | ((document: T) => string)
  className: string
  action?: (document: T) => Promise<unknown> | undefined
  reportEventOnClick?: string
  emitEventToClick?: string
  stopPropagationOnClick?: boolean
}

export type DocumentElement =
  | ImageDocumentElement
  | TitleDocumentElement
  | DescriptionDocumentElement
  | CustomDocumentElement
  | PriceElement
  | RegularPriceDocumentElement
  | RatingElement
  | SingleStarRatingElement
  | AddToCartElement
  | CustomHtmlElement
