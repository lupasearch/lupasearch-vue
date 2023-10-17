<script lang="ts" setup>
import ChatContainer from './components/chat/ChatContainer.vue'
import '../styles/clients/lupa/lupa'
import '../styles/chat/chat.scss'
import { ChatOptions } from './types/chat/ChatOptions'
import { SEARCH_RESULTS_CONFIGURATION } from './constants/development/searchResultsDev.const'
import { SearchResultsOptions } from './types/search-results/SearchResultsOptions'

const options: ChatOptions = {
  displayOptions: SEARCH_RESULTS_CONFIGURATION as unknown as SearchResultsOptions,
  sdkOptions: {
    customBaseUrl: 'http://localhost:8080/v1/',
    environment: 'production'
  },
  chatSettings: {
    model: "open-ai-gpt4"
  }
}
</script>
<template>
  <div id="app" class="wrapper">
    <link
      href="//db.onlinewebfonts.com/c/68590d1f06ad625cb73b5c34f85b4a1b?family=Luma-Icons"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css"
      rel="stylesheet"
    />
    <div>
      <ChatContainer :options="options" />
    </div>
  </div>
</template>
<style lang="scss">
#app {
  height: auto;
  display: flex;
  flex-direction: column;
}
html, body {
  background: #f4f4f4;
}
</style>
