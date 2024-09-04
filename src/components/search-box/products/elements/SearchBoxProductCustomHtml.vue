<script lang="ts" setup>
import type { Document } from '@getlupa/client-sdk/Types'
import type { CustomHtmlElement } from '@/types/DocumentElement'
import { renderHtmlTemplate } from '@/utils/render.utils'
import { computed } from 'vue'

const props = defineProps<{ item: Document; options: CustomHtmlElement }>()

const text = computed(() =>
  typeof props.options.html === 'string'
    ? renderHtmlTemplate(props.options.html, props.item)
    : props.options.html?.(props.item)
)
const className = computed((): string => props.options.className)

const handleClick = async (): Promise<void> => {
  if (!props.options.action) {
    return
  }
  await props.options.action(props.item)
}
</script>

<template>
  <div :class="className" v-html="text" v-on="options.action ? { click: handleClick } : {}"></div>
</template>
