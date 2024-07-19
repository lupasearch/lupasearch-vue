import { joinUrlParts } from './url.utils'

export const checkHasFullImageUrl = (imageUrl: string): boolean =>
  typeof imageUrl === 'string' &&
  (imageUrl.indexOf('http://') === 0 || imageUrl.indexOf('https://') === 0)

export const computeImageUrl = (imageUrl: string | string[], rootImageUrl: string): string => {
  const mainUrl = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl
  if (checkHasFullImageUrl(mainUrl)) {
    return mainUrl
  }
  return rootImageUrl ? joinUrlParts(rootImageUrl, mainUrl) : `/${mainUrl}`
}

export const replaceImageWithPlaceholder = (e: Event, placeholder: string): void => {
  const targetImage = e?.target as HTMLImageElement
  if (targetImage && !targetImage?.src?.includes(placeholder)) {
    targetImage.src = placeholder
  }
}
