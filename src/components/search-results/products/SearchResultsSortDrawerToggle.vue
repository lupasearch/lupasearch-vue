<script lang="ts" setup>
import { useSidebarToggle } from '@/composables/useSidebarToggle'

const { isSidebarVisible, sortLabel, sortToggleVisible, handleSortSidebarToggle } =
  useSidebarToggle()
</script>

<template>
  <div
    v-if="sortToggleVisible"
    class="lupa-mobile-toggle lupa-mobile-sort-toggle"
    @click="handleSortSidebarToggle"
    :class="{
      'lupa-sidebar-open': isSidebarVisible
    }"
  >
    {{ sortLabel }}
  </div>
</template>
