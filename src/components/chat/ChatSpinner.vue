<script lang="ts" setup>
defineProps<{
  small?: boolean
  message?: string
}>()
</script>

<template>
  <section class="lupa-chat-spinner">
    <div :class="{ small: small }" class="lds-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="lupa-chat-spinner-message">
      {{ message }}
    </div>
  </section>
</template>
