<script lang="ts" setup>
import { computed } from 'vue'
import type { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'

const props = defineProps<{
  options: ResultFacetOptions
}>()

const emit = defineEmits(['filter'])

const label = computed(() => props.options.labels?.facetFilterButton ?? '')

const handleClick = () => {
  emit('filter')
}
</script>

<template>
  <button v-if="label" class="lupa-facets-button-filter" @click.stop="handleClick">
    {{ label }}
  </button>
</template>
