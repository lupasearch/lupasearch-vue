<script lang="ts" setup>
import { computed } from 'vue'
import type { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'

const props = defineProps<{
  options: ResultFacetOptions
}>()

const emit = defineEmits(['clear'])

const label = computed(() => props.options.labels?.facetClearAllButton ?? '')

const handleClick = () => {
  emit('clear')
}
</script>

<template>
  <button v-if="label" class="lupa-facets-button-clear" @click.stop="handleClick">
    {{ label }}
  </button>
</template>
