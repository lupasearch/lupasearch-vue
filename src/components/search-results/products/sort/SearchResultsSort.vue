<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useSorting } from '@/composables/useSorting'

const {
  sortItems,
  selectedKey,
  ariaLabels,
  sotyByTitleLabel,
  sortStyle,
  handleSelect,
  setSortValue
} = useSorting()

onMounted(() => {
  setSortValue()
})

const showDefaultSort = computed((): boolean => {
  return !sortStyle.value || sortStyle.value?.type !== 'drawer'
})
</script>
<template>
  <div v-if="showDefaultSort" id="lupa-search-results-sort" class="lupa-search-results-sort">
    <div id="lupa-select">
      <label class="lupa-select-label" for="lupa-sort-select-dropdown">{{
        sotyByTitleLabel
      }}</label>
      <select
        id="lupa-sort-select-dropdown"
        class="lupa-select-dropdown"
        :aria-label="ariaLabels?.sortBySelect ?? sotyByTitleLabel"
        data-cy="lupa-sort-select-dropdown"
        v-model="selectedKey"
        @change="handleSelect"
        ref="select"
      >
        <option v-for="option in sortItems" :key="option.key" :value="option.key">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>
