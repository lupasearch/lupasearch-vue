export type PluginElementsConfiguration = {
  cssVariables?: string
  customStyles?: string
  searchBox?: string
  searchResults?: string
  recommendations?: string
  productList?: string
  genAiChat?: string
  tracking?: string
}

export type PluginConfiguration = {
  id: string
  configurationKey: string
  deploymentUrl?: string | null
  name?: string
  createdAt: string
  updatedAt: string

  configuration: PluginElementsConfiguration
  previewConfiguration?: PluginElementsConfiguration
}
