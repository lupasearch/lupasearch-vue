/* eslint-disable @typescript-eslint/no-explicit-any */
import { DisplayCondition } from '../DocumentElement'
import type { AnchorPosition } from './SearchResultsProductCardOptions'

export type SearchResultBadgeType = 'text' | 'image' | 'customHtml' | 'discount'

export type BadgeGenerateSeed = {
  id?: string
  backgroundColor?: string
  color?: string
  titleText?: string
  additionalText?: string
}

export type BadgeGenerateOptions<T = Record<string, any>> = {
  key?: string
  keyMap?: Record<keyof BadgeGenerateSeed, keyof T>
  image?: (field: BadgeGenerateSeed) => string | undefined
  showTitle?: (field: BadgeGenerateSeed) => boolean
  customClass?: (field: BadgeGenerateSeed) => string | undefined
}

export type BadgeOptions = {
  anchor?: AnchorPosition
  elements: BadgeElement[]
  generate?: BadgeGenerateOptions
  product?: any
  anchorElementKey?: string
}

export type SearchResultBadgeElement<T = any> = {
  type: SearchResultBadgeType
  key: string
  isHtml?: boolean
  className?: string
  product?: T
  display?: DisplayCondition | ((document: T) => boolean)
  rootImageUrl?: string
  maxItems?: number
  html?: string | ((doc: T) => string)
  position?: 'card' | 'image'
}

export type BaseBadgeElement<T = any> = SearchResultBadgeElement<T> & {
  value?: string
}

export type TextBadgeElement<T = any> = BaseBadgeElement<T> & {
  type: 'text'
  prefix?: string
  maxItems?: number
}

export type ImageBadgeElement<T = any> = BaseBadgeElement<T> & {
  type: 'image'
  rootImageUrl?: string
  maxItems?: number
}

export type CustomHtmlBadgeElement<T = any> = BaseBadgeElement<T> & {
  type: 'customHtml'
  className?: string
  html?: string | ((doc: T) => string)
}

export type DiscountBadgeElement<T = any> = BaseBadgeElement<T> & {
  type: 'discount'
  className?: string
  regularPriceKey?: string
  finalPriceKey?: string
  discountKey?: string
  discountType: 'percentage' | 'amount'
  labels?: {
    prefix?: string
    postfix?: string
  }
}

export type BadgeElement =
  | BaseBadgeElement
  | TextBadgeElement
  | ImageBadgeElement
  | CustomHtmlBadgeElement
  | DiscountBadgeElement

export enum BadgeType {
  NEWITEM = 'newItem',
  TEXT = 'text',
  IMAGE = 'image',
  CUSTOM_HTML = 'customHtml',
  DISCOUNT = 'discount'
}
