import type { SortDirection } from '../General'

export type SearchResultsSortOptions = {
  key: string
  label: string
  config: Record<string, SortDirection>[]
  default?: boolean
}

export type SortOptions = {
  label: string
  options: SearchResultsSortOptions[]
}
