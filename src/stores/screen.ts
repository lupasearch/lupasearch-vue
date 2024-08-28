import { S_MIN_WIDTH, MD_MIN_WIDTH, L_MIN_WIDTH, XL_MIN_WIDTH } from '@/constants/global.const'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useOptionsStore } from './options'

export const useScreenStore = defineStore('screen', () => {
  const measuredScreenWidth = ref(1000)

  const optionsStore = useOptionsStore()

  const screenWidth = computed(() => {
    const { searchResultOptions } = storeToRefs(optionsStore)

    return searchResultOptions.value.grid?.forcedScreenWidth ?? measuredScreenWidth.value
  })

  const configuredGridSizes = computed(() => {
    const { searchResultOptions } = storeToRefs(optionsStore)

    return {
      smMin: searchResultOptions?.value?.grid?.sizes?.sm ?? S_MIN_WIDTH,
      mdMin: searchResultOptions?.value?.grid?.sizes?.md ?? MD_MIN_WIDTH,
      lMin: searchResultOptions?.value?.grid?.sizes?.l ?? L_MIN_WIDTH,
      xlMin: searchResultOptions?.value?.grid?.sizes?.xl ?? XL_MIN_WIDTH
    }
  })

  const currentScreenWidth = computed(() => {
    const width = screenWidth.value
    if (width <= configuredGridSizes.value.smMin) {
      return 'xs'
    } else if (
      width > configuredGridSizes.value.smMin &&
      width <= configuredGridSizes.value.mdMin
    ) {
      return 'sm'
    } else if (width > configuredGridSizes.value.mdMin && width <= configuredGridSizes.value.lMin) {
      return 'md'
    } else if (width > configuredGridSizes.value.lMin && width <= configuredGridSizes.value.xlMin) {
      return 'l'
    } else {
      return 'xl'
    }
  })

  const isMobileWidth = computed(() => ['xs', 'sm']?.includes(currentScreenWidth.value))

  const setScreenWidth = ({ width }: { width: number }) => {
    measuredScreenWidth.value = width
  }

  return { screenWidth, currentScreenWidth, isMobileWidth, setScreenWidth }
})
