import { Environment } from '@getlupa/client-sdk/Types'

const Env = {
  production: 'https://api.lupasearch.com/v1/',
  staging: 'https://api.staging.lupasearch.com/v1/'
}

const VoiceServiceEnv = {
  production: 'ws://voice.lupasearch.com:3000',
  staging: 'ws://voice.lupasearch.dev:3000',
}

export const DEFAULT_REQUEST_CONFIG = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}

export const DEFAULT_HEADERS = DEFAULT_REQUEST_CONFIG.headers

export const getVoiceServiceApiUrl = (environment: Environment, customVoiceServiceUrl: string) => {
  if (customVoiceServiceUrl) {
    return customVoiceServiceUrl
  }
  return VoiceServiceEnv[environment] || VoiceServiceEnv['production']
}

export const getApiUrl = (environment: Environment, customBaseUrl?: string) => {
  if (customBaseUrl) {
    return customBaseUrl
  }
  return Env[environment] || Env['production']
}
