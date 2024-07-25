<script lang="ts" setup>
import type { CustomHtmlElement } from '@/types/DocumentElement'
import type { Document } from '@getlupa/client-sdk/Types'
import { computed } from 'vue'

const props = defineProps<{ item: Document; options: CustomHtmlElement }>()

const emit = defineEmits(['productEvent'])

const text = computed((): string => {
  return props.options.html(props.item)
})

const className = computed((): string => {
  return props.options.className
})

const handleClick = async (): Promise<void> => {
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
