const BIND_EVENT = 'click'

const getElements = (selectors: string[] = []) => {
  return selectors?.map((selector) => document.querySelector(selector)) ?? []
}

export const bindSearchTriggers = (triggers: string[] = [], event: () => unknown): void => {
  const elements = getElements(triggers)
  elements.forEach((e) => e?.addEventListener(BIND_EVENT, event))
}

export const unbindSearchTriggers = (triggers: string[] = [], event: () => unknown): void => {
  const elements = getElements(triggers)
  elements.forEach((e) => e?.removeEventListener(BIND_EVENT, event))
}
