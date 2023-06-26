import { S_MIN_WIDTH, MD_MIN_WIDTH, L_MIN_WIDTH, XL_MIN_WIDTH } from '@/constants/global.const'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useScreenStore = defineStore('screen', () => {
  const screenWidth = ref(1000)

  const currentScreenWidth = computed(() => {
    const width = screenWidth.value
    if (width <= S_MIN_WIDTH) {
      return 'xs'
    } else if (width > S_MIN_WIDTH && width <= MD_MIN_WIDTH) {
      return 'sm'
    } else if (width > MD_MIN_WIDTH && width <= L_MIN_WIDTH) {
      return 'md'
    } else if (width > L_MIN_WIDTH && width <= XL_MIN_WIDTH) {
      return 'l'
    } else {
      return 'xl'
    }
  })

  const isMobileWidth = computed(
    () => currentScreenWidth.value === 'sm' || currentScreenWidth.value === 'xs'
  )

  const setScreenWidth = ({ width }: { width: number }) => {
    screenWidth.value = width
  }

  return { screenWidth, currentScreenWidth, isMobileWidth, setScreenWidth }
})
