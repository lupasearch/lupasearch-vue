<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import { useSearchResultStore } from '@/stores/searchResult'
import type { ResultsLayout } from '@/types/search-results/ResultsLayout'
import { storeToRefs } from 'pinia'

const searchResultStore = useSearchResultStore()
const optionsStore = useOptionsStore()

const { layout } = storeToRefs(searchResultStore)
const { classMap } = storeToRefs(optionsStore)

const handleLayoutChange = (layout: ResultsLayout): void => {
  searchResultStore.setLayout(layout)
}
</script>

<template>
  <div id="lupa-search-results-layout-selection">
    <div
      :class="[
        'lupa-layout-selection-grid',
        classMap.layoutSelectionGrid,
        layout === 'Grid'
          ? 'lupa-layout-selection-active ' + classMap.layoutSelectionGridActive
          : ''
      ]"
      @click="handleLayoutChange('Grid')"
    >
      &#9783;
    </div>
    <div
      :class="[
        'lupa-layout-selection-list',
        classMap.layoutSelectionList,
        layout === 'List'
          ? 'lupa-layout-selection-active ' + classMap.layoutSelectionListActive
          : ''
      ]"
      data-cy="lupa-layout-selection-list"
      @click="handleLayoutChange('List')"
    >
      &#9776;
    </div>
  </div>
</template>
