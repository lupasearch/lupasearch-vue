import { QueryParams } from '@/types/search-results/QueryParams'
import { isEqual } from 'lodash'

export const joinUrlParts = (...parts: string[]) => {
  if (parts.length === 1) {
    return `${parts[0]}`
  }
  return (
    parts
      ?.map((part) => part.replace(/(^\/+|\/+$)/g, ''))
      ?.filter((part) => part !== '')
      ?.join('/') ?? ''
  )
}

export const findChangedParams = (oldParams: QueryParams, newParams: QueryParams): string[] => {
  const changedParams: string[] =[]
  const combinedParams = { ...oldParams, ...newParams }
  for (const key in combinedParams) {
    if (!isEqual(newParams[key], oldParams[key])) {
      changedParams.push(key)
    }
  }
  return changedParams
}
