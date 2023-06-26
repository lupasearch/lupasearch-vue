<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import { useSearchResultStore } from '@/stores/searchResult'
import type { SearchResultsBreadcrumb } from '@/types/search-results/SearchResultsOptions'
import { handleRoutingEvent } from '@/utils/routing.utils'
import { addParamsToLabel } from '@/utils/string.utils'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  breadcrumbs: SearchResultsBreadcrumb[]
}>()

const searchResultStore = useSearchResultStore()
const optionStore = useOptionsStore()
const { currentQueryText } = storeToRefs(searchResultStore)
const { searchResultOptions } = storeToRefs(optionStore)

const breadcrumbsValue = computed(() => props.breadcrumbs ?? [])

const hasEventRouting = computed((): boolean => {
  return searchResultOptions.value.routingBehavior === 'event'
})

const getLabel = (label: string): string => {
  return addParamsToLabel(label, `'${currentQueryText.value}'`)
}

const handleNavigation = (event: Event, link: string): void => {
  handleRoutingEvent(link, event, hasEventRouting.value)
}
</script>
<template>
  <div id="lupa-search-results-breadcrumbs">
    <span
      class="lupa-search-results-breadcrumb"
      v-for="(breadcrumb, index) in breadcrumbsValue"
      :key="index"
    >
      <a
        v-if="breadcrumb.link"
        class="lupa-search-results-breadcrumb-link"
        :href="breadcrumb.link"
        @click="(e) => handleNavigation(e, breadcrumb?.link ?? '')"
        >{{ getLabel(breadcrumb.label) }}</a
      >
      <span v-else class="lupa-search-results-breadcrumb-text">{{
        getLabel(breadcrumb.label)
      }}</span>
      <span v-if="index < breadcrumbsValue.length - 1"> / </span>
    </span>
  </div>
</template>
