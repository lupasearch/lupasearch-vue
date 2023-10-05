<script lang="ts" setup>
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'

defineProps<{ labels: SearchBoxOptionLabels }>()
</script>
<template>
  <p class="lupa-search-box-no-results">{{ labels.noResults }}</p>
</template>
