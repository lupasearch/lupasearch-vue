import type { DisplaySuggestion } from '@/types/search-box/Common'
import { getHint } from '@/utils/picker.utils'
import type { SuggestionQueryResult } from '@getlupa/client-sdk/Types'

export const SuggestionsMockData: SuggestionQueryResult = {
  success: true,
  items: [{ suggestion: 'knygos' }, { suggestion: 'knygų' }, { suggestion: 'knygų akcija' }]
}

export const DisplaySuggestionsMockData = (input: string): DisplaySuggestion[] => {
  return [
    {
      display: SuggestionsMockData.items[0].suggestion,
      displayHighlight: getHint(SuggestionsMockData.items[0].suggestion, input),
      suggestion: SuggestionsMockData.items[0]
    },
    {
      display: SuggestionsMockData.items[1].suggestion,
      displayHighlight: getHint(SuggestionsMockData.items[1].suggestion, input),
      suggestion: SuggestionsMockData.items[1]
    },
    {
      display: SuggestionsMockData.items[2].suggestion,
      displayHighlight: getHint(SuggestionsMockData.items[2].suggestion, input),
      suggestion: SuggestionsMockData.items[2]
    }
  ]
}
