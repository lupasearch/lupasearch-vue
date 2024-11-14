import lupaSearchSdk from '@getlupa/client-sdk'
import { RedirectionOptions } from '@/types/redirections/RedirectionOptions'
import { RedirectionRules, SdkError } from '@getlupa/client-sdk/Types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { SdkOptions } from '@/types/General'
import { inputMatches, inputsAreEqual } from '@/utils/string.utils'
import { RoutingBehavior } from '@/types/search-results/RoutingBehavior'
import { emitRoutingEvent } from '@/utils/routing.utils'

const CACHE_KEY = 'lupasearch-client-redirections'

export const useRedirectionStore = defineStore('redirections', () => {
  const redirections: Ref<RedirectionRules> = ref({ rules: [] })
  const redirectionOptions: Ref<RedirectionOptions> = ref({ enabled: false, queryKey: '' })

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          redirections: redirections.value,
          savedAt: Date.now(),
          queryKey: redirectionOptions.value.queryKey
        })
      )
    } catch {
      // local storage not available, do nothing
    }
  }

  const tryLoadFromLocalStorage = (config: RedirectionOptions) => {
    if (!config.cacheSeconds) return false

    try {
      const data = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '')
      if (data.queryKey !== config.queryKey) {
        return false
      }
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
    if (redirectionOptions.value?.enabled) {
      return
    }
    redirectionOptions.value = config
    if (!config?.enabled) {
      return
    }
    const loaded = tryLoadFromLocalStorage(config)
    if (loaded || redirections.value?.rules?.length > 0) {
      return
    }
    try {
      const result = await lupaSearchSdk.loadRedirectionRules(config.queryKey, options)
      if (!(result as RedirectionRules)?.rules?.length) {
        redirections.value = { rules: [] }
        return
      }
      redirections.value = result as RedirectionRules
      saveToLocalStorage()
    } catch {
      // Something went wrong, do nothing
    }
  }

  const redirectOnKeywordIfConfigured = (
    input: string,
    routingBehavior: RoutingBehavior = 'direct-link'
  ): boolean => {
    if (!redirections.value?.rules?.length) {
      return false
    }
    const redirectTo = redirections.value.rules.find((r) => inputsAreEqual(input, r.sources))
    if (!redirectTo) {
      return false
    }
    const url = redirectionOptions.value?.urlTransformer
      ? redirectionOptions.value?.urlTransformer(redirectTo?.target)
      : redirectTo?.target

    if (url === undefined || url === null || url === '') {
      return false
    }

    if (routingBehavior === 'event') {
      emitRoutingEvent(url)
    } else {
      window.location.assign(url)
    }
    return true
  }

  return {
    redirections,
    redirectOnKeywordIfConfigured,
    initiate
  }
})
