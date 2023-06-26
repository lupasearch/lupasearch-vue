<template>
  <div class="lupa-spinner-wrapper">
    <div class="lupa-spinner">
      <div v-for="x in 12" :key="x" />
    </div>
  </div>
</template>
<style lang="scss">
@import './styles/_spinner.scss';

.lupa-spinner-wrapper {
  width: 100%;
  overflow: hidden;
}
</style>
