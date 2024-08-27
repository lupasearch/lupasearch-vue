import { PluginConfiguration } from '@/types/configurations/PluginConfiguration'
import { SdkOptions } from '@/types/General'
import { DEFAULT_HEADERS, DEFAULT_REQUEST_CONFIG, getApiUrl } from '@/utils/api.utils'

export const fetchPluginConfiguration = async (
  options: SdkOptions,
  configurationKey: string
): Promise<PluginConfiguration | null> => {
  const { environment, customBaseUrl } = options
  try {
    const res = await fetch(
      `${getApiUrl(environment, customBaseUrl)}plugin/configurations/${configurationKey}`,
      {
        ...DEFAULT_REQUEST_CONFIG,
        method: 'GET',
        headers: { ...DEFAULT_HEADERS, ...(options.customHeaders ?? {}) }
      }
    )
    if (res.status < 400) {
      const data = await res.json()
      return { ...data }
    }
    const errors = await res.json()
    options?.onError?.(errors)
    return null
  } catch (e) {
    options?.onError?.(e)
    return null
  }
}
