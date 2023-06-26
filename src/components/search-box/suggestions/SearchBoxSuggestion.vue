<script lang="ts" setup>
import type { DisplaySuggestion } from '@/types/search-box/Common'
import type { SearchBoxOptionLabels } from '@/types/search-box/SearchBoxOptions'
import { computed } from 'vue'

const props = defineProps<{
  suggestion: DisplaySuggestion
  highlight?: boolean
  labels: SearchBoxOptionLabels
}>()

const emit = defineEmits(['select'])

const facetKey = computed(() => props.suggestion.facet?.key || '')

const facetLabel = computed(
  () =>
    props.suggestion.suggestion?.facetLabels?.[facetKey.value] ||
    props.labels.defaultFacetLabel ||
    facetKey.value
)

const handleSelect = (): void => {
  emit('select', {
    suggestion: props.suggestion.suggestion,
    facet: props.suggestion.facet,
    override: true
  })
}
</script>
<template>
  <div @click="handleSelect()">
    <div
      class="lupa-suggestion-value"
      data-cy="lupa-suggestion-value"
      v-if="highlight"
      v-html="suggestion.displayHighlight"
    ></div>
    <div data-cy="lupa-suggestion-value" class="lupa-suggestion-value" v-else>
      {{ suggestion.display }}
    </div>
    <div class="lupa-suggestion-facet" data-cy="lupa-suggestion-facet" v-if="suggestion.facet">
      <span class="lupa-suggestion-facet-label" data-cy="lupa-suggestion-facet-label">{{
        facetLabel
      }}</span>
      <span class="lupa-suggestion-facet-value" data-cy="lupa-suggestion-facet-value">{{
        suggestion.facet.title
      }}</span>
    </div>
  </div>
</template>
