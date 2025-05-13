<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import type { ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import { slugifyClass } from '@/utils/string.utils'
import type {
  FacetGroupItem,
  FilterGroupItemTypeHierarchy,
  HierarchyTree
} from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  options: ResultFacetOptions
  level: number
  item: HierarchyTree
  currentFilters: FilterGroupItemTypeHierarchy
}>()

const level = computed(() => props.level ?? 0)
const treeItem = computed(() => props.item ?? { key: '', children: [] })
const currentFilters = computed(() => props.currentFilters ?? { terms: [] })

const emit = defineEmits(['select'])

const showChildren = computed((): boolean => {
  return isChecked.value || level.value + 1 < (props.options.hierarchy?.maxInitialLevel ?? 2)
})

const isChecked = computed((): boolean => {
  return currentFilters.value?.terms?.some((t) => t.startsWith(treeItem.value.key)) ?? false
})

const handleFacetClick = (item: HierarchyTree): void => {
  emit('select', {
    value: item.key
  })
}

const getFacetValueClass = (item: FacetGroupItem): string => {
  try {
    return `lupa-facet-value-${slugifyClass(item.title)}`
  } catch (e) {
    return ''
  }
}
</script>
<template>
  <div class="lupa-facet-hierarchy" :class="{ 'lupa-term-active': isChecked }">
    <div class="lupa-facet-term" data-cy="lupa-facet-term" @click="handleFacetClick(item)">
      <div class="lupa-term-checkbox-wrapper">
        <span class="lupa-term-checkbox" :class="{ checked: isChecked }"> </span>
      </div>
      <div class="lupa-term-checkbox-label" :class="{ [getFacetValueClass(item)]: true }">
        <span class="lupa-term-label">{{ item.title }}{{ ' ' }}</span>
        <span v-if="options.showDocumentCount" class="lupa-term-count">({{ item.count }})</span>
      </div>
    </div>
    <div class="lupa-facet-level" v-if="showChildren">
      <HierarchyFacetLevel
        v-for="itemChild of treeItem.children"
        :key="itemChild.title"
        :options="options"
        :item="itemChild"
        :currentFilters="currentFilters"
        :level="level + 1"
        @select="(i) => $emit('select', i)"
      />
    </div>
  </div>
</template>
