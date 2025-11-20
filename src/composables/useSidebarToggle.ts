import { useOptionsStore } from '@/stores/options'
import { useSearchResultStore } from '@/stores/searchResult'
import { SearchResultsOptionLabels } from '@/types/search-results/SearchResultsOptions'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted } from 'vue'

export const useSidebarToggle = () => {
  const searchResultStore = useSearchResultStore()
  const optionsStore = useOptionsStore()
  const { currentFilterCount, isFilterSidebarVisible, isSortingSidebarVisible } =
    storeToRefs(searchResultStore)
  const { searchResultOptions } = storeToRefs(optionsStore)

  const labels = computed(() => {
    return searchResultOptions.value.labels as SearchResultsOptionLabels
  })

  const showMobileFilterCount = computed(
    () => searchResultOptions.value.filters?.currentFilters?.mobileSidebar?.showFilterCount ?? false
  )

  const disableMobileBodyScrollLock = computed(
    () => searchResultOptions.value.filters?.facets?.disableMobileBodyScrollLock ?? false
  )
  const isSidebarVisible = computed(
    () => isFilterSidebarVisible.value || isSortingSidebarVisible.value
  )

  const sortLabel = computed(() => searchResultOptions.value?.labels?.sortBy)

  const defaultLabel = computed(() => labels.value?.mobileFilterButton)

  const activeLabel = computed(() => labels.value?.mobileFilterButtonActive)

  const openLabel = computed(() => labels.value?.mobileFilterButtonOpen)

  const label = computed(() => {
    if (isSidebarVisible.value && openLabel.value) {
      return openLabel.value
    }
    if (hasActiveFilters.value && activeLabel.value) {
      return activeLabel.value
    }
    return defaultLabel.value
  })

  const sortToggleVisible = computed(() => {
    return searchResultOptions.value?.sortStyle?.type === 'drawer'
  })

  const handleFilterSidebarToggle = (): void => {
    searchResultStore.setSidebarState({
      visible: !isSidebarVisible.value,
      disableBodyScrolling: !disableMobileBodyScrollLock.value,
      sidebar: 'filter'
    })
  }

  const handleSortSidebarToggle = (): void => {
    searchResultStore.setSidebarState({
      visible: !isSortingSidebarVisible.value,
      disableBodyScrolling: !disableMobileBodyScrollLock.value,
      sidebar: 'sorting'
    })
  }

  const hasActiveFilters = computed(() => currentFilterCount.value > 0)

  const checkCloseOnEscape = (e: KeyboardEvent): void => {
    if (!['Escape', 'Esc'].includes(e.key ?? '')) {
      return
    }
    if (isSidebarVisible.value) {
      searchResultStore.setSidebarState({ visible: false, sidebar: 'sorting' })
      searchResultStore.setSidebarState({ visible: false, sidebar: 'filter' })
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', checkCloseOnEscape)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', checkCloseOnEscape)
  })

  return {
    isSidebarVisible,
    label,
    currentFilterCount,
    hasActiveFilters,
    showMobileFilterCount,
    sortLabel,
    sortToggleVisible,
    handleFilterSidebarToggle,
    handleSortSidebarToggle
  }
}
