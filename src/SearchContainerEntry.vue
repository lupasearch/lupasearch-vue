<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import SearchContainer from './components/search-container/SearchContainer.vue'
import type { SearchContainerOptions } from './types/search-container/SearchContainerOptions'
import { cloneDeep } from 'lodash'
import { QUERY_PARAMS } from './constants/queryParams.const'
import { useOptionsStore } from './stores/options'

const props = defineProps<{
  searchContainerOptions: SearchContainerOptions
}>()

const optionStore = useOptionsStore()

const isOpen = ref(false)

const triggerElement: Ref<Element | null> = ref(null)
const productList: Ref<Element | null> = ref(null)

const containerOptions = computed((): SearchContainerOptions => {
  return cloneDeep(props.searchContainerOptions)
})

const focus = (): void => {
  const el = document.querySelector('#lupa-search-box-input .lupa-search-box-input-field')
  ;(el as HTMLInputElement)?.focus()
}

const close = (): void => {
  isOpen.value = false
}

const openSearchContainer = (): void => {
  isOpen.value = true
}

const checkCloseOnEscape = (e: KeyboardEvent): void => {
  if (!['Escape', 'Esc'].includes(e.key ?? '')) {
    return
  }
  isOpen.value = false
}

const checkExistingQuery = (): void => {
  const url = new URL(window.location.href)
  const param = url.searchParams.get(optionStore.getQueryParamName(QUERY_PARAMS.QUERY))
  if (!param) {
    return
  }
  isOpen.value = true
}

const mountOpenListeners = (): void => {
  triggerElement.value = document.querySelector(props.searchContainerOptions?.trigger)
  triggerElement.value?.addEventListener('focus', openSearchContainer)
  window.addEventListener('keydown', checkCloseOnEscape)
}

onMounted(() => {
  mountOpenListeners()
  checkExistingQuery()
  isOpen.value = Boolean(containerOptions.value?.options?.isOpenInitially)
})

onBeforeUnmount(() => {
  triggerElement.value?.removeEventListener('focus', openSearchContainer)
  window.removeEventListener('keydown', checkCloseOnEscape)
})

const fetch = (): void => {
  ;(productList.value as any)?.fetch()
}

const reloadOptions = (): void => {
  ;(productList.value as any)?.reloadOptions()
}

defineExpose({ fetch, reloadOptions })
</script>

<template>
  <div>
    <SearchContainer
      v-if="containerOptions && isOpen"
      :options="containerOptions"
      ref="productList"
      @hook:mounted="focus"
      @close="close"
    />
  </div>
</template>
