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

export type DocumentElementBase<T = any> = {
  type: DocumentElementType
  key?: string
  display?: (document: T) => boolean
  isHtml?: boolean
  group?: string
  dynamic?: boolean
}

export type ImageDocumentElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.IMAGE
  placeholder: string
  baseUrl?: string
  key: string
  customUrl?: (document: T) => string
  alt?: (document: T) => string
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
  className?: string
}

export type CustomDocumentElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.CUSTOM
  maxLines?: number
  className?: string
  key: string
  label?: string
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
  labels: {
    addToCart: string
  }
}

export type CustomHtmlElement<T = any> = DocumentElementBase<T> & {
  type: DocumentElementType.CUSTOM_HTML
  html: (document: T) => string
  className: string
  action?: (document: T) => Promise<unknown> | undefined
  reportEventOnClick?: string
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
