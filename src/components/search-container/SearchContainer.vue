<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { cloneDeep, merge } from 'lodash'
import type { SearchContainerOptions } from '@/types/search-container/SearchContainerOptions'
import SearchBox from '../search-box/SearchBox.vue'
import SearchResults from '../search-results/SearchResults.vue'
import { useParamsStore } from '@/stores/params'
import { useOptionsStore } from '@/stores/options'
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import { DEFAULT_OPTIONS_RESULTS } from '@/constants/searchResults.const'
import { DEFAULT_SEARCH_BOX_OPTIONS } from '@/constants/searchBox.const'
import type { SearchBoxOptions } from '@/types/search-box/SearchBoxOptions'

const props = defineProps<{ options: SearchContainerOptions }>()

const paramStore = useParamsStore()
const optionsStore = useOptionsStore()

const searchResults = ref(null)
const searchBox = ref(null)

const fullSearchResultsOptions = computed((): SearchResultsOptions => {
  const options = cloneDeep(props.options.searchResults)
  return merge({}, DEFAULT_OPTIONS_RESULTS, options)
})

const fullSearchBoxOptions = computed((): SearchBoxOptions => {
  const options = cloneDeep(props.options.searchBox)
  return merge({}, DEFAULT_SEARCH_BOX_OPTIONS, options)
})

const fetch = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(searchResults.value as any)?.handleUrlChange()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(searchBox.value as any)?.handleSearch()
}

const innerClick = (): void => {
  // do nothing
}

const reloadOptions = (): void => {
  console.log('reloading options', fullSearchResultsOptions.value)
  setTimeout(() => {
    optionsStore.setSearchResultOptions({ options: fullSearchResultsOptions.value })
  })
}

onBeforeUnmount(() => {
  paramStore.removeParameters({ paramsToRemove: 'all' })
})

defineExpose({ reloadOptions, fetch })
</script>

<template>
  <div class="lupa-search-container-overlay" @click.stop.prevent="$emit('close')">
    <div id="lupa-search-container" class="lupa-search-container" @click.stop="innerClick">
      <div class="lupa-search-box-container">
        <SearchBox
          :options="fullSearchBoxOptions"
          :is-search-container="true"
          ref="searchBox"
          @close="$emit('close')"
        />
      </div>

      <SearchResults :options="fullSearchResultsOptions" :is-container="true" ref="searchResults" />
    </div>
  </div>
</template>
