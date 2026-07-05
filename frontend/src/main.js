import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Fuente única de la app
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar auth (restaura token del localStorage)
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')