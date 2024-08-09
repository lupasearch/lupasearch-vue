export type SearchResultsPaginationLabels = {
  pageSize: string
  showMore?: string
  showLess?: string
  itemCount: string
  filteredItemCount?: string
  pageSizePrefix?: string
}

export type SearchResultsPagination = {
  sizeSelection: {
    sizes: number[]
    position: SearchResultsPaginationPosition
  }
  pageSelection: {
    position: SearchResultsPaginationPosition
    display: number
  }
}

export type SearchResultsPaginationPosition = {
  top: boolean
  bottom: boolean
}
