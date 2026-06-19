import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
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