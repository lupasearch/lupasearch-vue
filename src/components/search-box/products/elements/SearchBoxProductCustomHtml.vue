<script lang="ts" setup>
import type { CustomHtmlElement } from '@/types/DocumentElement'
import { computed } from 'vue'

const props = defineProps<{ item: Document; options: CustomHtmlElement }>()

const text = computed(() => props.options.html(props.item))

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
