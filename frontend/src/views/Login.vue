<template>
  <div class="relative flex min-h-screen flex-col justify-center bg-gray-50 px-6 py-12 lg:px-8">

    <div class="relative sm:mx-auto sm:w-full sm:max-w-sm">
      <div class="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-deep)] text-xl font-bold text-white shadow-[var(--shadow-card)]">
        L
      </div>
      <h1 class="text-center text-4xl font-bold text-[var(--color-text-main)]">Ledgerly</h1>
      <h2 class="mt-4 text-center text-2xl font-bold tracking-tight text-[var(--color-text-main)]">Iniciar sesion</h2>
      <p class="mt-2 text-center text-sm text-[var(--color-text-muted)]">Sistema de gestion financiera para MiPymes</p>
    </div>

    <div class="relative mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <div v-if="error" class="mb-4 rounded-lg border border-rose-200 bg-[var(--color-danger-soft)] p-3">
        <p class="text-sm font-medium text-[var(--color-danger)]">{{ error }}</p>
      </div>
      
   <!--textox del email -->
      <div class="ledgerly-surface space-y-6 rounded-xl p-6">
        <div>
          <label for="email" class="block text-sm font-semibold text-[var(--color-text-main)]">Email</label>
          <div class="mt-2">
            <input
              id="email"
              v-model="email" 
              type="email"
              placeholder="contador@ledgerly.com"
              @keyup.enter="handleLogin"
              class="block w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-base text-[var(--color-text-main)] placeholder:text-[var(--color-text-soft)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] sm:text-sm"
              autocomplete="email"
            />
          </div>
        </div>
        <div>

            <!--textox del password -->
          <label for="password" class="block text-sm font-semibold text-[var(--color-text-main)]">Contrasena</label>
          <div class="mt-2">
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              @keyup.enter="handleLogin"
              class="block w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-base text-[var(--color-text-main)] placeholder:text-[var(--color-text-soft)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] sm:text-sm"
              autocomplete="current-password"

            />
          </div>
        </div>

            <!--textox del boton -->
        <button
          @click="handleLogin"
          :disabled="loading"
          class="flex w-full justify-center rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg v-if="loading" class="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Ingresando...' : 'Iniciar sesion' }}
        </button>
      </div>

      <p class="mt-6 text-center text-sm text-[var(--color-text-muted)]">(c) 2026 Ledgerly Base</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')


//revisar que no este vacios
async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Por favor ingresa tu email y contrasena'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { user, needsCompanySelection } = await authStore.loginUser(email.value, password.value)

    if (needsCompanySelection) {
      router.push('/seleccionar-empresa')
    } else if (user.role === 'admin') {
      router.push('/admin')
    } else if (user.role === 'dueno') {
      router.push('/income-statement')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>
