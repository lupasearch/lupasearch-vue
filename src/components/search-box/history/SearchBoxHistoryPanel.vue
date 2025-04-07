<script lang="ts" setup>
import { useHistoryStore } from '@/stores/history'
import { useSearchBoxStore } from '@/stores/searchBox'
import type { SearchBoxHistory } from '@/types/search-box/SearchBoxHistory'
import { storeToRefs } from 'pinia'
import { ref, computed, onBeforeMount, onMounted } from 'vue'
import SearchBoxHistoryItem from './SearchBoxHistoryItem.vue'

defineProps<{ options: SearchBoxHistory }>()

const historyStore = useHistoryStore()
const searchBoxStore = useSearchBoxStore()

const { highlightedIndex } = storeToRefs(searchBoxStore)
const { items: history } = storeToRefs(historyStore)

const emit = defineEmits(['go-to-results'])

const highlightIndex = computed(() => highlightedIndex.value ?? -1)

const hasHistory = computed(() => history.value && history.value.length > 0)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeMount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const availableLimits = ref([3, 5, 10, 20])
const selectedHistoryLimit = ref(5)

const limitedHistory = computed(() => {
  return (history.value ?? []).slice(0, selectedHistoryLimit.value)
})

const remove = ({ item }: { item: string }) => {
  historyStore.remove({ item })
}

const removeAll = () => {
  historyStore.clear()
}

const goToResults = ({ query }: { query: string }) => {
  emit('go-to-results', { query })
}

const handleKeyDown = (e: KeyboardEvent): void => {
  if (!hasHistory.value || highlightIndex.value < -1) {
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    goToResults({ query: history.value[highlightIndex.value] })
  }
}
</script>
<template>
  <div class="lupa-search-box-history-panel" v-if="hasHistory">
    <div class="history-dropdown">
      <label for="history-limit"> Show </label>
      <select id="history-limit" v-model="selectedHistoryLimit">
        <option v-for="limit in availableLimits" :value="limit" :key="limit">
          {{ limit }}
        </option>
      </select>
      <span>results</span>
    </div>
    <SearchBoxHistoryItem
      v-for="(item, index) in limitedHistory"
      :key="item"
      :item="item"
      :highlighted="index === highlightIndex"
      @click="goToResults"
      @remove="remove"
    />
    <div class="lupa-search-box-history-clear-all" @click="removeAll">
      {{ options.labels.clear }}
    </div>
  </div>
</template>