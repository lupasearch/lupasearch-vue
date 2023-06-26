<script lang="ts" setup>
import type { BadgeElement } from '@/types/search-results/BadgeOptions'

defineProps<{ badge: BadgeElement }>()
</script>

<template>
  <div class="lupa-new-item-badge" v-if="badge.isHtml" v-html="badge.value"></div>
  <div class="lupa-new-item-badge" v-else>
    {{ badge.value }}
  </div>
</template>
