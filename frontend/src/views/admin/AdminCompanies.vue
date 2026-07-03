<template>
  <div class="min-h-screen bg-gray-900">
    <div class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <router-link to="/admin" class="text-indigo-400 hover:text-indigo-300 mb-2 inline-block">
          Volver a Panel
        </router-link>
        <h1 class="text-3xl font-bold text-white">Registrar Empresas</h1>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <h2 class="text-xl font-bold text-white mb-4">Nueva Empresa</h2>

        <div v-if="error" class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md">
          <p class="text-sm text-red-400">{{ error }}</p>
        </div>
        <div v-if="success" class="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-md">
          <p class="text-sm text-green-400">{{ success }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Nombre de empresa</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ej: Panaderia La Espiga"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Moneda</label>
            <select v-model="form.currency" class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-indigo-500">
              <option value="HNL">HNL</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Anio fiscal</label>
            <input
              v-model.number="form.fiscalYear"
              type="number"
              min="2020"
              max="2030"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button
            @click="createCompany"
            :disabled="loading"
            class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-md font-medium"
          >
            {{ loading ? 'Guardando...' : 'Registrar Empresa' }}
          </button>
          <button @click="resetForm" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium">
            Limpiar
          </button>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-bold text-white mb-4">Empresas Registradas</h2>

        <div v-if="loadingCompanies" class="text-center py-8">
          <p class="text-gray-400">Cargando empresas...</p>
        </div>
        <div v-else-if="companies.length === 0" class="text-center py-8">
          <p class="text-gray-400">No hay empresas registradas</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-700">
                <th class="text-left py-3 px-4 font-semibold text-gray-300">Nombre</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-300">Moneda</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-300">Anio Fiscal</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-300">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="company in companies" :key="company._id" class="border-b border-gray-700 hover:bg-gray-700/50">
                <td class="py-3 px-4 text-gray-300">{{ company.name }}</td>
                <td class="py-3 px-4 text-gray-300">{{ company.currency }}</td>
                <td class="py-3 px-4 text-gray-300">{{ company.fiscalYear }}</td>
                <td class="py-3 px-4">
                  <span class="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-900/50 text-green-400">
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
    const res = await fetch(`${API}/companies`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
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
  form.value = {
    name: '',
    currency: 'HNL',
    fiscalYear: new Date().getFullYear()
  }
}
</script>
