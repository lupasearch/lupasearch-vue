import { LUPA_ROUTING_EVENT } from '@/constants/global.const'
import type { InputSuggestionFacet } from '@/types/search-box/Common'
import type { RoutingBehavior } from '..'
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

export const getPageUrl = (pathnameOverride?: string): URL => {
  const pathname = pathnameOverride || window.location.pathname
  return new URL(window.location.origin + pathname + window.location.search)
}
