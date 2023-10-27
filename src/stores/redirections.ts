import lupaSearchSdk from '@getlupa/client-sdk'
import { RedirectionOptions } from '@/types/redirections/RedirectionOptions'
import { RedirectionRules, SdkError } from '@getlupa/client-sdk/Types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { SdkOptions } from '@/types/General'

const CACHE_KEY = 'lupasearch-client-redirections'

export const useRedirectionStore = defineStore('redirections', () => {
  const redirections: Ref<RedirectionRules> = ref({ rules: [] })

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ redirections: redirections.value, savedAt: Date.now() })
      )
    } catch {
      // local storage not available, do nothing
    }
  }

  const tryLoadFromLocalStorage = (config: RedirectionOptions) => {
    if (!config.cacheSeconds) return false

    try {
      const data = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '')
      if (data?.redirections && Date.now() - data.savedAt < 1000 * config.cacheSeconds) {
        redirections.value = data.redirections
        return true
      }
    } catch {
      // Do nothing
    }

    return false
  }

  const initiate = async (config?: RedirectionOptions, options?: SdkOptions) => {
    if (!config?.enabled) {
      return
    }
    const loaded = tryLoadFromLocalStorage(config)
    if (loaded) {
      return
    }
    const result = await lupaSearchSdk.loadRedirectionRules(config.queryKey, options)
    if (!(result as SdkError).success) {
      return
    }
    redirections.value = result as RedirectionRules
    saveToLocalStorage()
  }

  return {
    redirections,
    initiate
  }
})
