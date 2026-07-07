<template>
  <div class="min-h-screen bg-gray-50 px-6 py-10">
    <div class="mx-auto max-w-5xl">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold text-[var(--color-primary)]">Ledgerly</p>
          <h1 class="mt-1 text-3xl font-bold text-[var(--color-text-main)]">Seleccionar empresa</h1>
          <p class="mt-2 text-sm text-[var(--color-text-muted)]">
            Hola {{ authStore.user?.name || 'usuario' }}, elige la empresa con la que vas a trabajar.
          </p>
        </div>

        <button
          type="button"
          class="rounded-md border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-main)] shadow-sm hover:bg-gray-50"
          @click="logout"
        >
          Cerrar sesión
        </button>
      </div>

      <div v-if="error" class="mb-5 rounded-lg border border-rose-200 bg-[var(--color-danger-soft)] p-3">
        <p class="text-sm font-medium text-[var(--color-danger)]">{{ error }}</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="company in companies"
          :key="company._id"
          type="button"
          class="rounded-lg border border-[var(--color-border)] bg-white p-5 text-left shadow-sm transition hover:border-[var(--color-primary)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="loadingCompanyId === company._id"
          @click="selectCompany(company)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-[var(--color-text-main)]">{{ company.name }}</h2>
              <p class="mt-1 text-sm text-[var(--color-text-muted)]">{{ roleLabel(company.role) }}</p>
            </div>

            <span class="rounded-md bg-[var(--color-primary-soft)] px-2 py-1 text-xs font-bold text-[var(--color-primary-deep)]">
              {{ company.code || 'Empresa' }}
            </span>
          </div>

          <p class="mt-5 text-sm font-semibold text-[var(--color-primary)]">
            {{ loadingCompanyId === company._id ? 'Entrando...' : 'Entrar' }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const error = ref('')
const loadingCompanyId = ref(null)

const companies = computed(() => authStore.availableCompanies || [])

function roleLabel(role) {
  return { contador: 'Contador', dueno: 'Dueño' }[role] || 'Usuario'
}

async function selectCompany(company) {
  loadingCompanyId.value = company._id
  error.value = ''

  try {
    await authStore.switchCompany(company._id)

    if (authStore.user?.role === 'dueno') {
      router.push('/income-statement')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'No se pudo seleccionar la empresa'
  } finally {
    loadingCompanyId.value = null
  }
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
