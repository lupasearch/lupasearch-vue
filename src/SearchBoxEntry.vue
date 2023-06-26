<script lang="ts" setup>
import { cloneDeep, merge } from 'lodash'
import { DEFAULT_SEARCH_BOX_OPTIONS } from './constants/searchBox.const'
import type { SearchBoxOptions } from './types/search-box/SearchBoxOptions'
import { computed, ref, type Ref } from 'vue'
import SearchBox from './components/search-box/SearchBox.vue'

const props = defineProps<{
  searchBoxOptions: SearchBoxOptions
}>()

const searchBox: Ref<null | any> = ref(null)

const fullSearchBoxOptions = computed((): SearchBoxOptions => {
  const options = cloneDeep(props.searchBoxOptions)
  return merge(DEFAULT_SEARCH_BOX_OPTIONS, options)
})

const fetch = (): void => {
  searchBox.value?.handleCurrentValueSearch()
}

defineExpose({ fetch })
</script>

<template>
  <SearchBox :options="fullSearchBoxOptions" ref="searchBox" />
</template>
