<script lang="ts" setup>
import { useSearchResultStore } from '@/stores/searchResult'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useOptionsStore } from '@/stores/options'
import SortList from '../products/sort/SortList.vue'
import { useSidebarToggle } from '@/composables/useSidebarToggle'
import { useParamsStore } from '@/stores/params'
import { QUERY_PARAMS } from '@/constants/queryParams.const'

const optionsStore = useOptionsStore()
const searchResultStore = useSearchResultStore()
const paramStore = useParamsStore()

const { searchResultOptions } = storeToRefs(optionsStore)
const { isSidebarClosing, isSortingSidebarVisible } = storeToRefs(searchResultStore)

const { handleSortSidebarToggle } = useSidebarToggle()

const sortStyleOptions = computed(() => {
  return searchResultOptions.value?.sortStyle
})

const sidebarTitle = computed((): string => {
  return sortStyleOptions?.value?.drawer?.labels?.title ?? ''
})

const clearSortLabel = computed((): string => {
  return sortStyleOptions?.value?.drawer?.labels?.clearLabel ?? ''
})

const applySortLabel = computed((): string => {
  return sortStyleOptions?.value?.drawer?.labels?.applyLabel ?? ''
})

const handleDrawerToggle = (): void => {
  searchResultStore.setSidebarState({ visible: false, sidebar: 'sorting' })
}

const clearSort = (): void => {
  paramStore.removeParameters({
    paramsToRemove: [optionsStore.getQueryParamName(QUERY_PARAMS.SORT)]
  })
  handleSortSidebarToggle()
}

const applySort = (): void => {
  handleSortSidebarToggle()
}
</script>

<template>
  <div
    class="lupa-sort-sidebar"
    :class="{ 'lupa-sort-is-closing': isSidebarClosing }"
    v-if="isSortingSidebarVisible"
  >
    <div class="lupa-sidebar-close" @click.stop="handleDrawerToggle"></div>
    <div class="lupa-sort-sidebar-content">
      <div class="lupa-sidebar-top">
        <div class="lupa-sidebar-title">
          {{ sidebarTitle }}
        </div>
        <div class="lupa-filter-toggle-mobile" @click="handleDrawerToggle"></div>
      </div>
      <div class="lupa-sidebar-sort-options">
        <SortList />
      </div>
      <div class="lupa-sidebar-sort-actions">
        <button
          v-if="clearSortLabel"
          type="button"
          class="lupa-sidebar-sort-clear"
          @click.stop="clearSort"
        >
          {{ clearSortLabel }}
        </button>
        <button
          v-if="applySortLabel"
          type="button"
          class="lupa-sidebar-sort-apply"
          @click.stop="applySort"
        >
          {{ applySortLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
