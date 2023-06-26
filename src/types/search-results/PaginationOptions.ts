import type { SearchResultsPaginationLabels } from './SearchResultsPagination'

export type PaginationOptions = {
  pageSize: PaginationPageSize
  pageSelect: PaginationPageSelect
  labels: SearchResultsPaginationLabels
}

export type PaginationPageSize = {
  sizes: number[]
  selectedSize: number
}

export type PaginationPageSelect = {
  count: number
  selectedPage: number
  display: number
  displayMobile: number
}

export type PaginationDisplay = {
  pageSize: boolean
  pageSelect: boolean
}
