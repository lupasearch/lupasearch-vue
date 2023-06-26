<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import { useParamsStore } from '@/stores/params'
import type { SdkOptions } from '@/types/General'
import type { SearchResultsAdditionalPanelOptions } from '@/types/search-results/SearchResultsAdditionalPanelOptions'
import { getLupaTrackingContext } from '@/utils/tracking.utils'
import type { SearchQueryResult } from '@getlupa/client-sdk/Types'
import type { Document } from '@getlupa/client-sdk/Types'
import lupaSearchSdk from '@getlupa/client-sdk'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { addParamsToLabel } from '@/utils/string.utils'

const props = defineProps<{
  panel: SearchResultsAdditionalPanelOptions
  options: SdkOptions
}>()

const result: Ref<SearchQueryResult> = ref({
  total: 0,
  searchText: '',
  items: [],
  success: true
})

const paramStore = useParamsStore()
const optionStore = useOptionsStore()

const { query, searchString } = storeToRefs(paramStore)
const { searchResultOptions } = storeToRefs(optionStore)

const showAll = ref(false)

const itemCount = computed((): number => {
  return result.value?.items.length ?? 0
})

const items = computed((): Document[] => {
  return result.value?.items ?? []
})

const displayShowMore = computed((): boolean => {
  return items.value.length > props.panel.initialCountLimit
})

const visibleItems = computed((): Document[] => {
  return showAll.value ? items.value : items.value.slice(0, props.panel.initialCountLimit)
})

const hasResults = computed((): boolean => {
  return Boolean(query.value && result.value.total > 0 && result.value.items.length)
})

watch(searchString, () => handleQueryChange())

const handleResults = (res: SearchQueryResult): void => {
  result.value = res
  searchResultOptions.value.callbacks?.onAdditionalPanelResults?.({
    queryKey: props.panel.queryKey,
    hasResults: res.total > 0
  })
}

const handleQueryChange = (): void => {
  const context = getLupaTrackingContext()
  const queryBody = {
    ...context,
    limit: props.panel.totalCountLimit,
    searchText: query.value
  }
  lupaSearchSdk
    .query(props.panel.queryKey, queryBody, props.options)
    .then((res) => {
      if (res.success) {
        handleResults(res)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}

const toggleShowMore = (): void => {
  showAll.value = !showAll.value
}

const addParams = (label: string, itemCount: number): string => {
  return addParamsToLabel(label, itemCount)
}

onMounted(() => {
  if (!query.value) {
    return
  }
  handleQueryChange()
})
</script>

<template>
  <div v-if="hasResults" class="lupa-results-additional-panel">
    <div class="lupa-results-additional-panel-items" data-cy="lupa-results-additional-panel-items">
      <SearchResultsProductCard
        v-for="(item, index) in visibleItems"
        :key="index"
        :product="item"
        :options="panel"
        :isAdditionalPanel="true"
      />
    </div>

    <div
      v-if="displayShowMore"
      class="lupa-additional-panel-show-more"
      :class="{ 'lupa-additional-panel-show-less': showAll }"
      data-cy="lupa-additional-panel-show-more"
      @click="toggleShowMore"
    >
      {{
        showAll
          ? addParams(panel.labels.showLess, itemCount)
          : addParams(panel.labels.showMore, itemCount)
      }}
    </div>
  </div>
</template>
