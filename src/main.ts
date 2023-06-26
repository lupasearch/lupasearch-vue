import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import AppContainer from './AppContainer.vue'
import AppRecommender from './AppRecommender.vue'

// For Dev: select feature:
// const Main = AppRecommender
const Main = AppContainer
// const Main = App

const app = createApp(Main)

app.use(createPinia())

app.mount('#app')
