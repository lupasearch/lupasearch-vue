<script lang="ts" setup>
import type { Document } from '@getlupa/client-sdk/Types'
import type { CustomDocumentElement } from '@/types/DocumentElement'
import { computed } from 'vue'

const props = defineProps<{ item: Document; options: CustomDocumentElement }>()

const text = computed((): string => {
  return props.item[props.options.key] as string
})

const className = computed((): string => {
  return props.options.className
})

const label = computed((): string | undefined => {
  return props.options.label
})

const isHtml = computed((): boolean => {
  return props.options.isHtml ?? false
})

const handleClick = async (): Promise<void> => {
  if (!props.options.action) {
    return
  }
  await props.options.action(props.item)
}
</script>
<template>
  <div
    :class="[className, 'lupa-search-box-product-custom']"
    v-if="isHtml"
    v-html="text"
    v-on="options.action ? { click: handleClick } : {}"
  ></div>
  <div
    v-else
    :class="[className, 'lupa-search-box-product-custom']"
    v-on="options.action ? { click: handleClick } : {}"
  >
    <div v-if="!label">
      {{ text }}
    </div>
    <div v-else>
      <div class="lupa-search-box-custom-label">{{ label }}</div>
      <div class="lupa-search-box-custom-text">{{ text }}</div>
    </div>
  </div>
</template>
