<script lang="ts" setup>
import type { ImageDocumentElement } from '@/types/DocumentElement'
import { joinUrlParts } from '@/utils/url.utils'
import type { Document } from '@getlupa/client-sdk/Types'
import { computed } from 'vue'

const props = defineProps<{
  item: Document
  options: ImageDocumentElement
  wrapperClass?: string
  imageClass?: string
}>()

const rootImageUrl = computed(() => props.options.baseUrl)

const image = computed(() => props.item[props.options.key] as string)

const hasFullImageUrl = computed(() => {
  const imageUrl = image.value
  return (
    typeof imageUrl === 'string' &&
    (imageUrl.indexOf('http://') === 0 || imageUrl.indexOf('https://') === 0)
  )
})

const imageUrl = computed(() => {
  const imageUrl = image.value
  if (hasFullImageUrl.value) {
    return imageUrl
  }
  return rootImageUrl.value ? joinUrlParts(rootImageUrl.value ?? '', imageUrl) : imageUrl
})

const hasImage = computed(() => Boolean(hasFullImageUrl.value || image.value))

const placeholder = computed(() => props.options.placeholder)

const finalUrl = computed(() => {
  if (props.options.customUrl) {
    return props.options.customUrl(props.item)
  }
  return hasImage.value ? imageUrl.value : placeholder.value
})

const replaceWithPlaceholder = (e: Event): void => {
  const targetImage = e?.target as HTMLImageElement
  if (targetImage && !targetImage?.src?.includes(placeholder.value)) {
    targetImage.src = placeholder.value
  }
}

const imageAlt = computed(() => {
  const alt = props.options.alt
  if (alt) {
    return alt(props.item)
  }
  return ''
})
</script>
<template>
  <div :class="wrapperClass ?? ''">
    <img
      :class="imageClass ?? ''"
      :src="finalUrl"
      v-bind="{ alt: imageAlt ? imageAlt : undefined }"
      @error="replaceWithPlaceholder"
    />
  </div>
</template>
