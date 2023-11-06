export type RedirectionOptions = {
  enabled: boolean
  queryKey: string
  cacheSeconds?: number
  urlTransfromer?: (redirectTo: string) => string
}
