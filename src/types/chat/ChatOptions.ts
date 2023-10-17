import { SdkOptions } from '../General'
import { SearchResultsOptions } from '../search-results/SearchResultsOptions'

export type ChatSettings = {
  model?: string
}

export type ChatOptions = {
  sdkOptions: SdkOptions
  displayOptions: SearchResultsOptions
  chatSettings?: ChatSettings
}
