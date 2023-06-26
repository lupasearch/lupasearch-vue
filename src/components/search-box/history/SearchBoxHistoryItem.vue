<script lang="ts" setup>
const props = defineProps<{ item: string; highlighted: boolean }>()

const emit = defineEmits(['remove', 'click'])

const remove = () => {
  emit('remove', { item: props.item })
}

const click = () => {
  emit('click', { query: props.item })
}
</script>

<template>
  <div class="lupa-search-box-history-item">
    <div class="lupa-search-box-history-item-content">
      <div
        class="lupa-search-box-history-item-text"
        :class="{ 'lupa-search-box-history-item-highlighted': highlighted }"
        @click="click"
      >
        {{ item }}
      </div>
      <div class="lupa-search-box-history-item-clear" @click="remove">×</div>
    </div>
  </div>
</template>
