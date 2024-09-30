<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import CategoryFilterItem from './CategoryFilterItem.vue'
import { storeToRefs } from 'pinia'
import type { CategoryFilterOptions } from '@/types/product-list/ProductListOptions'
import { computed, onMounted, ref, type Ref } from 'vue'
import { linksMatch } from '@/utils/link.utils'
import lupaSearchSdk from '@getlupa/client-sdk'
import type { SdkError, SearchQueryResult } from '@getlupa/client-sdk/Types'
import { handleRoutingEvent } from '@/utils/routing.utils'
import { useSearchResultStore } from '@/stores/searchResult'

const props = defineProps<{
  options: CategoryFilterOptions
}>()

const categoryChildren: Ref<Record<string, string>[]> = ref([])

const optionStore = useOptionsStore()
const searchResultsStore = useSearchResultStore()
const { envOptions, searchResultOptions } = storeToRefs(optionStore)

const hasBackButton = computed((): boolean => {
  return Boolean(props.options.back?.title)
})

const hasEventRouting = computed((): boolean => {
  return props.options.routingBehavior === 'event'
})

const backTitle = computed((): string | undefined => {
  return props.options.back?.title
})

const backUrlLink = computed((): string | undefined => {
  return props.options.back?.url ?? ''
})

const parentTitle = computed((): string | undefined => {
  return props.options.parent?.title
})

const parentUrlLink = computed((): string | undefined => {
  return props.options.parent?.url ?? ''
})

const isActive = (): boolean => {
  if (!window) {
    return false
  }
  return linksMatch(parentUrlLink.value, window.location.origin + window.location.pathname)
}

const handleResult = (result: SearchQueryResult | SdkError): void => {
  if (!result.success || !props.options?.queryKey) {
    return
  }
  categoryChildren.value = result.items as Record<string, string>[]
  searchResultsStore.setRelatedCategoryChildren(categoryChildren.value)
  searchResultOptions.value.callbacks?.onCategoryFilterResults?.({
    queryKey: props.options.queryKey,
    hasResults: result.total > 0
  })
}

const fetch = async (): Promise<void> => {
  if (!props.options?.queryKey) {
    return
  }
  const result = await lupaSearchSdk.query(
    props.options.queryKey,
    {
      searchText: '',
      filters: props.options.filters
    },
    envOptions.value
  )
  handleResult(result)
}

onMounted(async () => {
  await fetch()
})

const getCategoryKey = (item: Record<string, string>): string => {
  return item?.[props.options.keys.titleKey ?? ''] + item?.[props.options.keys.urlKey ?? '']
}

const handleNavigationParent = (event?: Event): void => {
  if (!parentUrlLink.value) {
    return
  }
  handleRoutingEvent(parentUrlLink.value, event, hasEventRouting.value)
}

const handleNavigationBack = (event?: Event): void => {
  if (!backUrlLink.value) {
    return
  }
  handleRoutingEvent(backUrlLink.value, event, hasEventRouting.value)
}

defineExpose({ fetch })
</script>
<template>
  <div class="lupa-category-filter" data-cy="lupa-category-filter">
    <div class="lupa-category-back">
      <a
        v-if="hasBackButton"
        data-cy="lupa-category-back"
        :href="backUrlLink"
        @click="handleNavigationBack"
      >
        {{ backTitle }}
      </a>
    </div>
    <div class="lupa-current-category" :class="{ 'lupa-current-category-active': isActive }">
      <a
        data-cy="lupa-current-category"
        :href="parentUrlLink"
        :class="{ 'lupa-title-category': !hasBackButton }"
        @click="handleNavigationParent"
        >{{ parentTitle }}</a
      >
    </div>

    <div class="lupa-child-category-list">
      <CategoryFilterItem
        v-for="child of categoryChildren"
        :key="getCategoryKey(child)"
        :item="child"
        :options="options"
      />
    </div>
  </div>
</template>
