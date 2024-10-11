import { SdkOptions } from '../General'
import { SearchResultsOptions } from '../search-results/SearchResultsOptions'

export type ChatSettings = {
  model?: string
  labels?: {
    ask?: string
    clear?: string
    bestMatches?: string
    checkingForMorePhraseMatches?: string
    selectingBestPhrases?: string
  }
}

export type ChatOptions = {
  sdkOptions: SdkOptions
  displayOptions: SearchResultsOptions
  chatSettings?: ChatSettings
}
