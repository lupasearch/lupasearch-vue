import type { FilterGroup } from '@getlupa/client-sdk/Types'

export type QueryParams = {
  filters?: FilterGroup
} & Record<string, string>
