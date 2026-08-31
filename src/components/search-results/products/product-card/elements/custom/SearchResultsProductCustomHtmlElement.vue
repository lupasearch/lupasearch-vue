<script lang="ts" setup>
import type { CustomHtmlElement } from '@/types/DocumentElement'
import { renderHtmlTemplate } from '@/utils/render.utils'
import { escapeDocumentValues } from '@/utils/escape.utils'
import { useAutoEscapeDocumentData } from '@/composables/useAutoEscapeDocumentData'
import type { Document } from '@getlupa/client-sdk/Types'
import { computed } from 'vue'

const props = defineProps<{ item: Document; options: CustomHtmlElement }>()

const emit = defineEmits(['productEvent'])

const { autoEscapeDocumentData } = useAutoEscapeDocumentData()

const escapedItem = computed((): Document =>
  autoEscapeDocumentData.value && !props.options.useRawHtml
    ? escapeDocumentValues(props.item)
    : props.item
)

const text = computed(() =>
  typeof props.options.html === 'string'
    ? renderHtmlTemplate(props.options.html, props.item)
    : props.options.html?.(escapedItem.value, props.item)
)

const className = computed((): string => {
  return props.options.className
})

const handleClick = async (e: MouseEvent): Promise<void> => {
  if (e && props.options.stopPropagationOnClick) {
    e.stopPropagation()
    e.preventDefault()
  }
  if (!props.options.action) {
    return
  }
  if (props.options.reportEventOnClick) {
    emit('productEvent', { type: props.options.reportEventOnClick })
  }
  await props.options.action(props.item)
}
</script>
<template>
  <div :class="className" v-html="text" v-on="options.action ? { click: handleClick } : {}"></div>
</template>
