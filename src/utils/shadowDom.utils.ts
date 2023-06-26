import type { SearchContainerConfigOptions } from '@/types/search-container/SearchContainerOptions'

export const createShadowDom = (
  shadowId: string,
  managerId: string
): { host: HTMLElement; manager: HTMLElement } => {
  let host = document.getElementById(shadowId)
  if (host) {
    host.remove()
  }
  host = document.createElement('div')
  const manager = document.createElement('div')
  host.setAttribute('id', shadowId)
  manager?.setAttribute('id', managerId)
  return { host, manager }
}

export const attatchShadowDom = ({
  host,
  manager,
  styleUrl,
  options
}: {
  host: HTMLElement
  manager: HTMLElement
  styleUrl: string
  options?: SearchContainerConfigOptions
}): void => {
  if (host.shadowRoot) {
    return
  }

  const link = document.createElement('link')
  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.href = styleUrl

  // Fonts only work when added in host document head

  const fontLink = document.createElement('link')
  fontLink.type = 'text/css'
  fontLink.rel = 'stylesheet'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap'
  document.head.appendChild(fontLink)

  // Add font for material icons

  const materialIconLink = document.createElement('link')
  materialIconLink.type = 'text/css'
  materialIconLink.rel = 'stylesheet'
  materialIconLink.href =
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,1,-50..200'
  document.head.appendChild(materialIconLink)

  const shadow = host.attachShadow({ mode: 'open' })
  shadow.appendChild(manager)
  shadow.appendChild(link)

  // Configure main display options

  if (options?.layout?.marginLeft) {
    const style = document.createElement('style')
    style.innerHTML = `.lupa-search-container-overlay { width: calc(100% - ${options.layout.marginLeft}px); margin-left: ${options.layout.marginLeft}px; }`
    shadow.appendChild(style)
  }
}
