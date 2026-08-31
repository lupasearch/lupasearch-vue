import { useOptionsStore } from '@/stores/options'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

// Enabled when set in either options store, so single-integration clients don't miss it.
export const useAutoEscapeDocumentData = () => {
  const optionsStore = useOptionsStore()
  const { searchBoxOptions, searchResultOptions } = storeToRefs(optionsStore)

  const autoEscapeDocumentData = computed(
    () =>
      (searchBoxOptions.value?.autoEscapeDocumentData ||
        searchResultOptions.value?.autoEscapeDocumentData) ??
      false
  )

  return { autoEscapeDocumentData }
}
