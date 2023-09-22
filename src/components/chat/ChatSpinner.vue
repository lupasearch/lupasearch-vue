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
<style lang="scss" scoped>
.lds-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.lds-ring.small {
  width: 40px;
  height: 40px;
  border-width: 6px;

  div {
    width: 32px;
    height: 32px;
    border-width: 6px;
  }
}
</style>
