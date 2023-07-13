import { LUPA_ROUTING_EVENT } from '@/constants/global.const'
import type { InputSuggestionFacet } from '@/types/search-box/Common'
import type { RoutingBehavior, SsrOptions } from '..'
import { generateResultLink } from './link.utils'

export const emitRoutingEvent = (url: string): void => {
  const event = new CustomEvent(LUPA_ROUTING_EVENT, { detail: url })
  window.dispatchEvent(event)
}

export const handleRoutingEvent = (link: string, event?: Event, hasEventRouting = false): void => {
  if (!hasEventRouting) {
    return
  }
  event?.preventDefault()
  emitRoutingEvent(link)
}

export const redirectToResultsPage = (
  link: string,
  searchText: string,
  facet?: InputSuggestionFacet,
  routingBehavior: RoutingBehavior = 'direct-link'
): void => {
  const url = generateResultLink(link, searchText, facet)
  if (routingBehavior === 'event') {
    emitRoutingEvent(url)
  } else {
    window.location.assign(url)
  }
}

export const getPageUrl = (pathnameOverride?: string, ssr?: SsrOptions): URL => {
  // If window is defined, we're in a browser environment
  if (typeof window !== 'undefined') {
    const pathname = pathnameOverride || window.location.pathname
    const origin = window.location.origin
    const search = window.location.search
    return new URL(origin + pathname + search)
  }
  return new URL(ssr.url, ssr.baseUrl)
}
