import type { AnalyticsOptions } from './AnalyticsOptions'
import type { Environment as SdkEnvironment, Document } from '@getlupa/client-sdk/Types'

export type CustomDocumentHtmlAttributes = (doc: Document) => Record<string, unknown>

export type SdkOptions = {
  environment: SdkEnvironment
  customBaseUrl?: string
  customUrl?: string
  customPayload?: Record<string, unknown>
  customHeaders?: Record<string, string>
  onError?: (err: unknown) => unknown
}

export type TrackingOptions = {
  trackBase?: boolean
  trackSession?: boolean
  trackUser?: boolean
  userKey?: string
  analytics?: AnalyticsOptions
}

export type Environment = SdkEnvironment
export type SortDirection = 'asc' | 'desc'
export type ScreenSize = 'xs' | 'sm' | 'md' | 'l' | 'xl'

export type LupaQueryParamName = 'QUERY' | 'PAGE' | 'LIMIT' | 'SORT'
export type LupaQueryParamValue = 'q' | 'p' | 'l' | 's'
