<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchResultStore } from '@/stores/searchResult'
import type { PaginationPageSelect } from '@/types/search-results/PaginationOptions'
import { useScreenStore } from '@/stores/screen'
import { useParamsStore } from '@/stores/params'
import { QUERY_PARAMS } from '@/constants/queryParams.const'
import { scrollToSearchResults } from '@/utils/scroll.utils'
import { useOptionsStore } from '@/stores/options'
import { RESULT_ROOT_SELECTOR } from '@/constants/global.const'

const props = defineProps<{
  lastPageLabel?: string
  firstPageLabel?: string
  options: PaginationPageSelect
}>()

const lastPageLabel = computed(() => props.lastPageLabel ?? '>')
const firstPageLabel = computed(() => props.firstPageLabel ?? '<')

const paramStore = useParamsStore()
const screenStore = useScreenStore()
const optionsStore = useOptionsStore()

const { isMobileWidth } = storeToRefs(screenStore)
const { searchResultOptions } = storeToRefs(optionsStore)

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

const scrollToResultsOptions = computed(() => ({
  enabled:
    searchResultOptions.value.scrollToResults?.enabled === undefined
      ? true
      : searchResultOptions.value.scrollToResults?.enabled,
  container:
    searchResultOptions.value.scrollToResults?.scrollToContainerSelector ?? RESULT_ROOT_SELECTOR,
  timeout: searchResultOptions.value.scrollToResults?.timeout ?? 500
}))

const tagName = computed((): string => {
  return props.options.renderAsLinks ? 'a' : 'div'
})

const getPageUrlWithNewParams = (page: number): string => {
  return paramStore.getPageUrlWithNewParams({
    params: [{ name: optionsStore.getQueryParamName(QUERY_PARAMS.PAGE), value: page.toString() }]
  })
}

const getHref = (page: number): string => {
  if (props.options.renderAsLinks) {
    return getPageUrlWithNewParams(page)
  }
  return null
}

const handlePageChange = (e: MouseEvent, page: number): void => {
  // we still want frontend handling even if rendered as links for max speed while preserving SEO links
  if (e && props.options.renderAsLinks) {
    e.preventDefault()
  }
  if (page > 0) {
    paramStore.appendParams({
      params: [{ name: optionsStore.getQueryParamName(QUERY_PARAMS.PAGE), value: page.toString() }]
    })
    if (scrollToResultsOptions.value.enabled) {
      scrollToSearchResults(
        scrollToResultsOptions.value.timeout,
        scrollToResultsOptions.value.container
      )
    }
  }
}
</script>

<template>
  <div
    id="lupa-search-results-page-select"
    data-cy="lupa-search-results-page-select"
    v-if="showPagination"
  >
    <component
      :is="tagName"
      v-if="showBack"
      :class="firstPageLabel === '<' ? 'lupa-page-arrow' : 'lupa-show-less'"
      :href="getHref(options.selectedPage - 1)"
      @click="(e) => handlePageChange(e, options.selectedPage - 1)"
    >
      {{ firstPageLabel }}
    </component>
    <template v-if="showFirstPage">
      <component
        :is="tagName"
        :href="getHref(1)"
        class="lupa-page-number lupa-page-number-first"
        @click="(e) => handlePageChange(e, 1)"
      >
        1
      </component>
      <div v-if="showFirstPageSeparator" class="lupa-page-number-separator">...</div>
    </template>
    <component
      :is="tagName"
      v-for="page in pages"
      :key="page"
      :href="getHref(page)"
      @click="(e) => handlePageChange(e, page)"
      :class="[
        'lupa-page-number',
        page === options.selectedPage ? 'lupa-page-number-selected' : ''
      ]"
      data-cy="lupa-page-number"
    >
      {{ page }}
    </component>
    <template v-if="showLastPage">
      <div v-if="showLastPageSeparator" class="lupa-page-number-separator">...</div>
      <component
        :is="tagName"
        :href="getHref(lastPage ?? 1)"
        class="lupa-page-number lupa-page-number-last"
        @click="(e) => handlePageChange(e, lastPage ?? 1)"
      >
        {{ lastPage }}
      </component>
    </template>
    <component
      v-if="options.selectedPage < options.count"
      :is="tagName"
      :class="lastPageLabel === '>' ? 'lupa-page-arrow' : 'lupa-show-more'"
      :href="getHref(options.selectedPage + 1)"
      data-cy="lupa-show-more"
      @click="(e) => handlePageChange(e, options.selectedPage + 1)"
    >
      {{ lastPageLabel }}
    </component>
  </div>
</template>
