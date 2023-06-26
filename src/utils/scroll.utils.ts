const RESULT_ROOT_ID = 'lupa-search-results'
const SHADOW_ROOT_ID = 'lupa-shadow-id'

const CONTAINER_ROOT_ID = 'lupa-search-container'

export const scrollToSearchResults = (timeout = 500): void => {
  if (timeout) {
    setTimeout(() => scrollTo(RESULT_ROOT_ID), timeout)
  } else {
    scrollTo(RESULT_ROOT_ID)
  }
}

export const scrollTo = (elementId: string): void => {
  let el = document.getElementById(elementId)
  const shadowRoot = document.getElementById(SHADOW_ROOT_ID)?.shadowRoot
  if (!el) {
    el = shadowRoot?.getElementById(elementId) ?? null
  }
  if (!el) {
    return
  }
  const searchContainer = shadowRoot ? shadowRoot.getElementById(CONTAINER_ROOT_ID) : undefined
  const container = searchContainer ?? window
  container.scrollTo({
    top: el.offsetTop,
    behavior: 'smooth'
  })
}

export const disableBodyScroll = (): void => {
  const scrollY = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
}

export const enableBodyScroll = (): void => {
  const scrollY = document.body.style.top
  document.body.style.position = ''
  document.body.style.top = ''
  window.scrollTo(0, parseInt(scrollY || '0') * -1)
}
