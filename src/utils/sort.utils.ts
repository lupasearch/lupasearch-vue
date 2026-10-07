import { SORT_DIRECTION_SEPARATOR, SORT_FIELD_SEPARATOR } from '@/constants/queryParams.const'
import type { SearchResultsSortOptions } from '@/types/search-results/SearchResultsSort'
import type { SortDirection } from '@/types/General'

type SortConfig = Record<string, SortDirection>[]

const SORT_DIRECTIONS: SortDirection[] = ['asc', 'desc']

/** `[{ in_stock: 'desc' }, { price: 'asc' }]` → `in_stock:desc,price:asc` */
export const serializeSort = (sort: SortConfig): string => {
  return sort
    .flatMap((s) =>
      Object.entries(s).map(
        ([field, direction]) => `${field}${SORT_DIRECTION_SEPARATOR}${direction}`
      )
    )
    .join(SORT_FIELD_SEPARATOR)
}

/**
 * `in_stock:desc,price:asc` → `[{ in_stock: 'desc' }, { price: 'asc' }]`.
 * Undefined if the value is not a valid serialized sort
 */
export const parseSerializedSort = (value?: string): SortConfig | undefined => {
  if (!value) {
    return undefined
  }
  const sort: SortConfig = []
  for (const part of value.split(SORT_FIELD_SEPARATOR)) {
    const separatorIndex = part.lastIndexOf(SORT_DIRECTION_SEPARATOR)
    const field = part.slice(0, separatorIndex).trim()
    const direction = part.slice(separatorIndex + 1).trim() as SortDirection
    if (separatorIndex < 1 || !field || !SORT_DIRECTIONS.includes(direction)) {
      return undefined
    }
    sort.push({ [field]: direction })
  }
  return sort
}

const sortsMatch = (a: SortConfig, b: SortConfig): boolean => {
  return serializeSort(a) === serializeSort(b)
}

export const findSortKey = (
  sortOptions: SearchResultsSortOptions[] = [],
  sort: SortConfig
): string | undefined => {
  return sortOptions.find((option) => sortsMatch(option.config ?? [], sort))?.key
}

/** Sort param value: configured sort key if one matches, serialized sort otherwise */
export const getSortParamValue = (
  sortOptions: SearchResultsSortOptions[] = [],
  sort: SortConfig
): string => {
  return findSortKey(sortOptions, sort) ?? serializeSort(sort)
}
