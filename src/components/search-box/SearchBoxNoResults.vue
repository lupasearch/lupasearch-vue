<script lang="ts" setup>
import type { SearchBoxOptionLabels, SearchBoxOptions, SearchBoxPanelOptions } from '@/types/search-box/SearchBoxOptions'
import { computed } from 'vue'

const props = defineProps<{ options: SearchBoxPanelOptions }>()

const customHtml = computed<string | undefined>(() => {
  return props.options.noResultsCustomHtml
})

const labels = computed<SearchBoxOptionLabels>(() => {
  return props.options.labels
})
</script>
<template>
  <div v-if="customHtml" class="lupa-search-box-no-results" v-html="customHtml"></div>
  <p v-else class="lupa-search-box-no-results">{{ labels?.noResults }}</p>
</template>
