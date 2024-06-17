<script lang="ts" setup>
import type { BadgeGenerateSeed, BadgeOptions } from '@/types/search-results/BadgeOptions'
import { computed } from 'vue'
import SearchResultGeneratedBadge from './SearchResultGeneratedBadge.vue';

const props = defineProps<{ options: BadgeOptions }>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const badgeField = computed((): Record<string, any>[] => {
  const fieldHasBadges =
    props.options.generate?.key &&
    props.options.product?.[props.options.generate?.key ?? ''] &&
    Array.isArray(props.options.product[props.options.generate?.key ?? ''])

  return fieldHasBadges ? props.options.product[props.options.generate?.key ?? ''] : []
})

const keyMap = computed((): Record<string, string> => {
  return props.options.generate?.keyMap ?? {}
})

const badges = computed((): BadgeGenerateSeed[] => {
  return badgeField.value
    .filter((f) => Boolean(f))
    .map((f) => ({
      backgroundColor: keyMap.value.backgroundColor ? f[keyMap.value.backgroundColor] : undefined,
      color: keyMap.value.color ? f[keyMap.value.color] : undefined,
      titleText: keyMap.value.titleText ? f[keyMap.value.titleText] : undefined,
      additionalText: keyMap.value.additionalText ? f[keyMap.value.additionalText] : undefined,
      id: keyMap.value.id ? f[keyMap.value.id] : undefined
    }))
    .filter((b) => Boolean(b.id))
})
</script>
<template>
  <div class="lupa-generated-badges">
    <SearchResultGeneratedBadge
      v-for="badge in badges"
      :key="badge.id"
      :badge="badge"
      :options="options"
    />
  </div>
</template>
