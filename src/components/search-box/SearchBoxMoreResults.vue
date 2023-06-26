<script lang="ts" setup>
import { useSearchBoxStore } from '@/stores/searchBox'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{ labels: SearchBoxOptionLabels; showTotalCount: boolean }>()

const searchBoxStore = useSearchBoxStore()
const { docResults, options } = storeToRefs(searchBoxStore)

const emit = defineEmits(['go-to-results'])

const totalCount = computed((): string => {
  if (!props.showTotalCount) {
    return ''
  }
  const queryKey = options.value?.panels.find((x) => x.type === 'document')?.queryKey
  const total = queryKey ? docResults.value[queryKey]?.total : ''
  return total ? `(${total})` : ''
})

const handleClick = (): void => {
  emit('go-to-results')
}
</script>
<template>
  <a class="lupa-more-results" data-cy="lupa-more-results" @click="handleClick"
    >{{ labels.moreResults }} {{ totalCount }}</a
  >
</template>
