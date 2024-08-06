import { S_MIN_WIDTH, MD_MIN_WIDTH, L_MIN_WIDTH, XL_MIN_WIDTH } from '@/constants/global.const'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useOptionsStore } from './options'

export const useScreenStore = defineStore('screen', () => {
  const screenWidth = ref(1000)
  const optionsStore = useOptionsStore()

  const configuredGridSizes = computed(() => {
    return {
      smMin: optionsStore.searchResultOptions?.grid?.sizes?.sm ?? S_MIN_WIDTH,
      mdMin: optionsStore.searchResultOptions?.grid?.sizes?.md ?? MD_MIN_WIDTH,
      lMin: optionsStore.searchResultOptions?.grid?.sizes?.l ?? L_MIN_WIDTH,
      xlMin: optionsStore.searchResultOptions?.grid?.sizes?.xl ?? XL_MIN_WIDTH
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
    screenWidth.value = width
  }

  return { screenWidth, currentScreenWidth, isMobileWidth, setScreenWidth }
})
