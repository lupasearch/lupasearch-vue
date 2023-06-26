<script lang="ts" setup>
import type { SearchResultsAdditionalPanels } from '@/types/search-results/SearchResultsOptions'
import AdditionalPanel from './AdditionalPanel.vue'
import type { Document } from '@getlupa/client-sdk/Types'
import type { SdkOptions } from '@/types/General'
import { computed } from 'vue'
import type { SearchResultsAdditionalPanelOptions } from '@/types/search-results/SearchResultsAdditionalPanelOptions'

const props = defineProps<{
  options: SearchResultsAdditionalPanels
  sdkOptions: SdkOptions
  location: 'top' | 'bottom'
}>()

const locationPanels = computed((): SearchResultsAdditionalPanelOptions[] => {
  return props.options.additionalPanels?.filter((p) => p.location === props.location) ?? []
})

const isVisible = computed((): boolean => {
  return locationPanels.value.length > 0
})
</script>

<template>
  <div v-if="isVisible" class="lupa-results-additional-panels">
    <AdditionalPanel
      v-for="panel of locationPanels"
      :key="panel.queryKey"
      :panel="panel"
      :options="sdkOptions"
    >
    </AdditionalPanel>
  </div>
</template>
