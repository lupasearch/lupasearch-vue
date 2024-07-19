<script lang="ts" setup>
import type { ImageDocumentElement } from '@/types/DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  checkHasFullImageUrl,
  computeImageUrl,
  replaceImageWithPlaceholder
} from '@/utils/image.utils'

const props = defineProps<{
  item: Document
  options: ImageDocumentElement
  wrapperClass?: string
  imageClass?: string
}>()

const isHover = ref(false)
const hoverImageIndex = ref(0)
const hoverInterval = ref(0)

const rootImageUrl = computed(() => props.options.baseUrl)

const image = computed(() => props.item[props.options.key] as string)

const hasFullImageUrl = computed(() => {
  return checkHasFullImageUrl(image.value)
})

const imageUrl = computed(() => {
  return computeImageUrl(image.value, rootImageUrl.value)
})

const hasImage = computed(() => Boolean(hasFullImageUrl.value || image.value))

const placeholder = computed(() => props.options.placeholder)

const finalMainImageUrl = computed(() => {
  if (props.options.customUrl) {
    return props.options.customUrl(props.item)
  }
  return hasImage.value ? imageUrl.value : placeholder.value
})

const hoverImages = computed(() => {
  if (props.options.hoverImages?.key) {
    return (
      (props.item[props.options.hoverImages?.key] as string[])
        ?.slice(0, props.options.hoverImages?.maxImages ?? 5)
        ?.map((i) => computeImageUrl(i, rootImageUrl.value)) ?? []
    )
  }
  if (props.options.hoverImages) {
    return (
      props.options.hoverImages
        ?.display(props.item)
        ?.slice(0, props.options.hoverImages?.maxImages ?? 5) ?? []
    )
  }
  return []
})

const hasHoverImages = computed(() => {
  return Boolean(hoverImages.value?.length)
})

const replaceWithPlaceholder = (e: Event): void => {
  replaceImageWithPlaceholder(e, placeholder.value)
}

const setNextHoverImage = (): void => {
  hoverImageIndex.value = (hoverImageIndex.value + 1) % hoverImages.value.length
}

const currentHoverImage = computed(() => {
  return hoverImages.value[hoverImageIndex.value]
})

const finalUrl = computed(() => {
  return isHover.value ? currentHoverImage.value : finalMainImageUrl.value
})

const handleMouseEnter = (): void => {
  if (!hasHoverImages.value) {
    return
  }
  isHover.value = true
  hoverImageIndex.value = 0
  if (hoverInterval.value) {
    return
  }
  hoverInterval.value = setInterval(
    setNextHoverImage,
    props.options.hoverImages?.cycleInterval ?? 2000
  ) as unknown as number
}

const handleMouseLeave = (): void => {
  if (!hasHoverImages.value) {
    return
  }
  isHover.value = false
  clearInterval(hoverInterval.value)
  hoverInterval.value = 0
}

const imageAlt = computed(() => {
  const alt = props.options.alt
  if (alt) {
    return alt(props.item)
  }
  return ''
})

const preloadImages = (images: string[]): void => {
  images.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}

onMounted(() => {
  if (hasHoverImages.value) {
    preloadImages(hoverImages.value)
  }
})

watch(hoverImages, (newImages) => {
  if (newImages.length) {
    preloadImages(newImages)
  }
})

onBeforeUnmount(() => {
  clearInterval(hoverInterval.value)
})
</script>
<template>
  <div
    :class="{ [wrapperClass]: Boolean(wrapperClass), 'lupa-images-hover': isHover }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <transition name="lupa-fade">
      <img
        class="lupa-images-hover-image"
        :class="{ [imageClass]: true, 'lupa-images-hover-image': isHover }"
        :src="finalUrl"
        v-bind="{ alt: imageAlt ? imageAlt : undefined }"
        @error="replaceWithPlaceholder"
        :key="finalUrl"
      />
    </transition>
  </div>
</template>
