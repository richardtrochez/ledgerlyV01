<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Registrar Empresas"
        subtitle="Crea empresas para asignarlas a los contadores despues."
      >
        <template #action>
          <router-link to="/admin">
            <BaseButton variant="outline">Volver al panel</BaseButton>
          </router-link>
        </template>
      </PageHeader>

      <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Nueva empresa</h2>

        <div v-if="error" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p class="text-sm text-amber-800">{{ error }}</p>
        </div>
        <div v-if="success" class="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p class="text-sm text-emerald-700">{{ success }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de empresa</label>
            <input v-model="form.name" type="text" placeholder="Ej: Panaderia La Espiga"
              class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select v-model="form.currency"
              class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="HNL">HNL</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Anio fiscal</label>
            <input v-model.number="form.fiscalYear" type="number" min="2020" max="2030"
              class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
        </div>

        <div class="mt-5 flex gap-2">
          <BaseButton variant="primary" :loading="loading" @click="createCompany">
            {{ loading ? 'Guardando' : 'Registrar empresa' }}
          </BaseButton>
          <BaseButton variant="outline" @click="resetForm">Limpiar</BaseButton>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Empresas registradas</h2>

        <div v-if="loadingCompanies" class="text-center py-8 text-sm text-gray-500">
          Cargando empresas...
        </div>
        <EmptyState v-else-if="companies.length === 0" icon="folder" message="No hay empresas registradas todavia." />

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</th>
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Moneda</th>
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Anio fiscal</th>
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="company in companies" :key="company._id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <td class="py-3 px-4 text-gray-900 font-medium">{{ company.name }}</td>
                <td class="py-3 px-4 text-gray-700">{{ company.currency }}</td>
                <td class="py-3 px-4 text-gray-700">{{ company.fiscalYear }}</td>
                <td class="py-3 px-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset"
                    :class="company.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/20'">
                    {{ company.isActive ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const authStore = useAuthStore()
const API = 'http://localhost:4000/api'

const form = ref({
  name: '',
  currency: 'HNL',
  fiscalYear: new Date().getFullYear()
})

const companies = ref([])
const loading = ref(false)
const loadingCompanies = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  if (authStore.user?.role !== 'admin') {
    router.push('/dashboard')
    return
  }
  loadCompanies()
})

async function loadCompanies() {
  loadingCompanies.value = true
  try {
    const res = await fetch(`${API}/companies`, { headers: { Authorization: `Bearer ${authStore.token}` } })
    if (!res.ok) throw new Error('Error al cargar empresas')
    const data = await res.json()
    companies.value = data.data || []
  } catch (err) {
    error.value = err.message || 'Error al cargar empresas'
  } finally {
    loadingCompanies.value = false
  }
}

async function createCompany() {
  error.value = ''
  success.value = ''
  if (!form.value.name) {
    error.value = 'El nombre de la empresa es requerido'
    return
  }
  loading.value = true
  try {
    const res = await fetch(`${API}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
      body: JSON.stringify({
        name: form.value.name,
        currency: form.value.currency,
        fiscalYear: form.value.fiscalYear,
        ownerId: authStore.user?.id
      })
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Error al registrar empresa')
    }
    success.value = 'Empresa registrada exitosamente'
    resetForm()
    loadCompanies()
  } catch (err) {
    error.value = err.message || 'Error al registrar empresa'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { name: '', currency: 'HNL', fiscalYear: new Date().getFullYear() }
}
</script>
