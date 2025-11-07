<script lang="ts" setup>
import { onMounted } from 'vue'
import { useSorting } from '@/composables/useSorting'

const { sortItems, selectedKey, ariaLabels, sotyByTitleLabel, handleSelect, setSortValue } =
  useSorting()

onMounted(() => {
  setSortValue()
})

const selectValue = (key: string) => {
  selectedKey.value = key
  handleSelect()
}
</script>
<template>
  <div id="lupa-search-results-sort-list" class="lupa-search-results-sort-list">
    <ul>
      <li
        v-for="option in sortItems"
        :key="option.key"
        :class="{ 'lupa-sort-item-selected': option.key === selectedKey }"
        @click="selectValue(option.key)"
      >
        <label :for="'lupa-sort-list-' + option.key"> {{ option.label }}</label>
        <input
          :id="'lupa-sort-list-' + option.key"
          type="radio"
          :checked="option.key === selectedKey"
        />
      </li>
    </ul>
  </div>
</template>
