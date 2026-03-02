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

const vuetify = createVuetify({
  components,
  directives,
})

const pinia = createPinia()

createApp(App).use(router).use(pinia).use(vuetify).mount('#app')
