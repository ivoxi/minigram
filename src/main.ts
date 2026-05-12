import { createApp } from 'vue'
import './style.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import router from './router'
import { createPinia } from 'pinia'
import { setUnauthorizedHandler } from './api/chatApi'
import { useAuthStore } from './stores/useAuthStore'
import { useChatsStore } from './stores/useChatsStore'

const vuetify = createVuetify({
  components,
  directives,
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const authStore = useAuthStore()
authStore.hydrate()

setUnauthorizedHandler(() => {
  const chatsStore = useChatsStore()
  chatsStore.reset()
  authStore.logout()
  void router.push({ name: 'login' })
})

app.use(router).use(vuetify).mount('#app')
