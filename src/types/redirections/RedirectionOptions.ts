export type RedirectionOptions = {
  enabled: boolean
  queryKey: string
  cacheSeconds?: number
  urlTransformer?: (redirectTo: string) => string
}
