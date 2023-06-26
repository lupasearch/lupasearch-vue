<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchResultStore } from '@/stores/searchResult'
import type { PaginationPageSelect } from '@/types/search-results/PaginationOptions'
import { useScreenStore } from '@/stores/screen'
import { useParamsStore } from '@/stores/params'
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { scrollToSearchResults } from '@/utils/scroll.utils'

const props = defineProps<{
  lastPageLabel?: string
  firstPageLabel?: string
  options: PaginationPageSelect
}>()

const lastPageLabel = computed(() => props.lastPageLabel ?? '>')
const firstPageLabel = computed(() => props.firstPageLabel ?? '<')

const paramStore = useParamsStore()
const screenStore = useScreenStore()

const { isMobileWidth } = storeToRefs(screenStore)

const pageOptionsCount = computed((): number => {
  return isMobileWidth.value ? props.options.displayMobile : props.options.display
})

const pages = computed((): number[] => {
  const currentPage = Math.min(props.options.count, props.options.selectedPage)
  const delta = Math.floor(pageOptionsCount.value / 2),
    left = currentPage - delta,
    right = currentPage + (pageOptionsCount.value - delta)

  return Array.from({ length: props.options.count }, (v, k) => k + 1).filter(
    (i) => i && i >= left && i < right
  )
})

const showBack = computed((): boolean => {
  return props.options.selectedPage > 1 && props.options.selectedPage <= props.options.count
})

const lastPage = computed((): number | undefined => {
  return props.options.count ?? undefined
})

const showLastPage = computed((): boolean => {
  return Boolean(lastPage.value && !pages.value.includes(lastPage.value))
})

const showLastPageSeparator = computed((): boolean => {
  return showLastPage.value && !pages.value.includes((lastPage.value ?? 0) - 1)
})

const showFirstPage = computed((): boolean => {
  return !pages.value.includes(1)
})

const showFirstPageSeparator = computed((): boolean => {
  return showFirstPage.value && !pages.value.includes(2)
})

const showPagination = computed((): boolean => {
  return pages.value.length > 1
})

const handlePageChange = (page: number): void => {
  if (page > 0) {
    paramStore.appendParams({
      params: [{ name: QUERY_PARAMS.PAGE, value: page.toString() }]
    })
    scrollToSearchResults()
  }
}
</script>

<template>
  <div
    id="lupa-search-results-page-select"
    data-cy="lupa-search-results-page-select"
    v-if="showPagination"
  >
    <div
      v-if="showBack"
      :class="firstPageLabel === '<' ? 'lupa-page-arrow' : 'lupa-show-less'"
      @click="() => handlePageChange(options.selectedPage - 1)"
    >
      {{ firstPageLabel }}
    </div>
    <template v-if="showFirstPage">
      <div class="lupa-page-number lupa-page-number-first" @click="() => handlePageChange(1)">
        1
      </div>
      <div v-if="showFirstPageSeparator" class="lupa-page-number-separator">...</div>
    </template>
    <div
      v-for="page in pages"
      :key="page"
      @click="() => handlePageChange(page)"
      :class="[
        'lupa-page-number',
        page === options.selectedPage ? 'lupa-page-number-selected' : ''
      ]"
      data-cy="lupa-page-number"
    >
      {{ page }}
    </div>
    <template v-if="showLastPage">
      <div v-if="showLastPageSeparator" class="lupa-page-number-separator">...</div>
      <div
        class="lupa-page-number lupa-page-number-last"
        @click="() => handlePageChange(lastPage ?? 1)"
      >
        {{ lastPage }}
      </div>
    </template>
    <div
      v-if="options.selectedPage < options.count"
      :class="lastPageLabel === '>' ? 'lupa-page-arrow' : 'lupa-show-more'"
      data-cy="lupa-show-more"
      @click="() => handlePageChange(options.selectedPage + 1)"
    >
      {{ lastPageLabel }}
    </div>
  </div>
</template>
