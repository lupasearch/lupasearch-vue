import { FilterTranslationOptions } from '@/types/search-results/FilterTranslationOptions'
import { FacetGroupItem, FacetResult } from '@getlupa/client-sdk/Types'

export const getTranslatedFacetKey = (
  facet: { key: string; label: string },
  translations?: FilterTranslationOptions
): string => {
  return translations?.keyTranslations?.[facet.key] ?? facet.label
}

export const getTranslatedFacetValue = (
  facet: { key: string },
  value: { title: string },
  translations?: FilterTranslationOptions
) => {
  return translations?.valueTranslations?.[facet.key]?.[value?.title] ?? value.title
}
