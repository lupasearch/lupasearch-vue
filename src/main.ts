import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import AppSlots from './AppSlots.vue'
import AppProductList from './AppProductList.vue'
import AppContainer from './AppContainer.vue'
import AppRecommender from './AppRecommender.vue'
import AppChat from './AppChat.vue'

// For Dev: select feature:
// const Main = AppRecommender
// const Main = AppContainer
// const Main = AppProductList
// const Main = AppSlots
const Main = App
// const Main = AppChat

const app = createApp(Main)

app.use(createPinia())

app.mount('#app')
