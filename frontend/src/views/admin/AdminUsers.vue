<template>
  <div class="min-h-screen bg-gray-900">
    <div class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div>
          <router-link to="/admin" class="text-indigo-400 hover:text-indigo-300 mb-2 inline-block">
            Volver a Panel
          </router-link>
          <h1 class="text-3xl font-bold text-white">Gestion de Usuarios</h1>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Crear usuario -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <h2 class="text-xl font-bold text-white mb-4">Crear Nuevo Usuario</h2>

        <div v-if="formError" class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md">
          <p class="text-sm text-red-400">{{ formError }}</p>
        </div>
        <div v-if="formSuccess" class="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-md">
          <p class="text-sm text-green-400">{{ formSuccess }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input v-model="formData.email" type="email" placeholder="usuario@ledgerly.com" class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Telefono</label>
            <input v-model="formData.telefono" type="tel" placeholder="0000-0000" class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
            <input v-model="formData.name" type="text" placeholder="Nombre completo" class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Contrasena</label>
            <input v-model="formData.password" type="password" placeholder="********" class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Rol</label>
            <select v-model="formData.role" class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-indigo-500">
              <option value="contador">Contador</option>
              <option value="dueno">Dueno</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <!-- Empresas asignadas (solo si NO es admin) -->
          <div v-if="formData.role !== 'admin'">
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Empresas asignadas
              <span class="text-gray-500 text-xs">(escribe y agrega)</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="companySearch"
                list="company-options"
                type="text"
                placeholder="Nombre de empresa"
                class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                @keyup.enter="addCompanyToForm"
              />
              <button
                type="button"
                @click="addCompanyToForm"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
              >
                Agregar
              </button>
            </div>

            <datalist id="company-options">
              <option v-for="c in companies" :key="c._id" :value="c.name" />
            </datalist>

            <div class="mt-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 min-h-10">
              <div v-if="selectedFormCompanies.length > 0" class="space-y-1">
                <div v-for="c in selectedFormCompanies" :key="c._id" class="flex items-center justify-between gap-2 text-sm text-gray-200">
                  <span>{{ c.name }}</span>
                  <button type="button" @click="removeCompanyFromForm(c._id)" class="text-xs text-red-400 hover:text-red-300">
                    Quitar
                  </button>
                </div>
              </div>
              <p v-if="companies.length === 0" class="text-xs text-gray-500 py-1">
                No hay empresas registradas todavia.
              </p>
              <p v-else-if="selectedFormCompanies.length === 0" class="text-xs text-gray-500 py-1">
                Ninguna empresa agregada.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button @click="createUser" :disabled="loading" class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-md font-medium">
            {{ loading ? 'Creando...' : 'Crear Usuario' }}
          </button>
          <button @click="resetForm" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium">
            Limpiar
          </button>
        </div>
      </div>

      <!-- Tabla usuarios -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-bold text-white mb-4">Usuarios Registrados</h2>

        <div v-if="loadingUsers" class="text-center py-8">
          <p class="text-gray-400">Cargando usuarios...</p>
        </div>
        <div v-else-if="users.length === 0" class="text-center py-8">
          <p class="text-gray-400">No hay usuarios registrados</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-700">
                <th class="text-left py-3 px-4 font-semibold text-gray-300">Email</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-300">Nombre</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-300">Rol</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-300">Empresas</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u._id" class="border-b border-gray-700 hover:bg-gray-700/50 align-top">
                <td class="py-3 px-4 text-gray-300">{{ u.email }}</td>
                <td class="py-3 px-4 text-gray-300">{{ u.name }}</td>
                <td class="py-3 px-4">
                  <span :class="getRoleBadgeClass(u.role)" class="inline-block px-2 py-1 rounded text-xs font-semibold">
                    {{ getRoleLabel(u.role) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div v-if="u.role === 'admin'" class="text-gray-500 text-sm italic">Admin global</div>
                  <div v-else class="space-y-1">
                    <div v-for="c in u.companies" :key="c._id" class="flex items-center gap-2">
                      <span class="text-sm text-gray-200">{{ c.name }}</span>
                      <span class="text-xs text-gray-500">({{ getRoleLabel(c.role) }})</span>
                      <button
                        @click="removeCompany(u._id, c._id)"
                        class="text-xs text-red-400 hover:text-red-300"
                        title="Quitar empresa"
                      >
                        Quitar
                      </button>
                    </div>
                    <!-- Agregar empresa -->
                    <div class="flex items-center gap-2 mt-1" v-if="availableForUser(u).length > 0">
                      <input
                        v-model="addCompanyTexts[u._id]"
                        list="company-options"
                        type="text"
                        placeholder="Nombre de empresa"
                        class="text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200 placeholder-gray-500"
                        @keyup.enter="addCompany(u._id, u.role)"
                      />
                      <button
                        v-if="addCompanyTexts[u._id]"
                        @click="addCompany(u._id, u.role)"
                        class="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 text-center">
                  <button @click="deleteUser(u._id)" :disabled="loading" class="text-red-400 hover:text-red-300 text-sm disabled:opacity-50">
                    Eliminar
                  </button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const API = 'http://localhost:4000/api'

const formData = ref({
  email: '', name: '', telefono: '', password: '',
  role: 'contador',
  companyIds: []
})

const users = ref([])
const companies = ref([])
const companySearch = ref('')
const addCompanyTexts = ref({})  // { userId: nombreEmpresaEscrito }
const loading = ref(false)
const loadingUsers = ref(false)
const formError = ref('')
const formSuccess = ref('')

const selectedFormCompanies = computed(() => {
  return companies.value.filter(c => formData.value.companyIds.includes(c._id))
})

onMounted(() => {
  if (authStore.user?.role !== 'admin') {
    router.push('/dashboard')
    return
  }
  loadCompanies()
  loadUsers()
})

async function loadCompanies() {
  try {
    const res = await fetch(`${API}/companies`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.ok) {
      const data = await res.json()
      companies.value = data.data || []
    }
  } catch (err) { console.error(err) }
}

async function loadUsers() {
  loadingUsers.value = true
  try {
    const response = await fetch(`${API}/users`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (!response.ok) throw new Error('Error al cargar usuarios')
    const data = await response.json()
    users.value = data.data || []
  } catch (error) {
    console.error('Error cargando usuarios:', error)
    formError.value = 'Error al cargar usuarios'
  } finally {
    loadingUsers.value = false
  }
}

async function createUser() {
  formError.value = ''
  formSuccess.value = ''

  if (!formData.value.email || !formData.value.name || !formData.value.password) {
    formError.value = 'Email, nombre y contrasena son requeridos'
    return
  }
  if (formData.value.role !== 'admin' && formData.value.companyIds.length === 0) {
    formError.value = 'Selecciona al menos una empresa para contador o dueno'
    return
  }

  loading.value = true
  try {
    const response = await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
      body: JSON.stringify({
        email: formData.value.email,
        name: formData.value.name,
        telefono: formData.value.telefono,
        password: formData.value.password,
        role: formData.value.role,
        companyIds: formData.value.role === 'admin' ? [] : formData.value.companyIds
      })
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || 'Error al crear usuario')
    }
    formSuccess.value = 'Usuario creado exitosamente'
    resetForm()
    loadUsers()
  } catch (error) {
    formError.value = error.message || 'Error al crear usuario'
  } finally {
    loading.value = false
  }
}

async function deleteUser(userId) {
  if (!confirm('Estas seguro de que quieres eliminar este usuario?')) return
  loading.value = true
  try {
    const res = await fetch(`${API}/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (!res.ok) throw new Error('Error al eliminar usuario')
    formSuccess.value = 'Usuario eliminado exitosamente'
    loadUsers()
  } catch (error) {
    formError.value = 'Error al eliminar usuario'
  } finally {
    loading.value = false
  }
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function findCompanyByText(text, list = companies.value) {
  const normalized = normalizeText(text)
  if (!normalized) return null

  const exact = list.find(c => normalizeText(c.name) === normalized)
  if (exact) return exact

  const matches = list.filter(c => normalizeText(c.name).includes(normalized))
  return matches.length === 1 ? matches[0] : null
}

function addCompanyToForm() {
  formError.value = ''
  formSuccess.value = ''

  const company = findCompanyByText(companySearch.value)
  if (!company) {
    formError.value = 'Empresa no encontrada. Primero registrala en el panel de empresas.'
    return
  }

  if (formData.value.companyIds.includes(company._id)) {
    formError.value = 'Esa empresa ya fue agregada.'
    return
  }

  formData.value.companyIds.push(company._id)
  companySearch.value = ''
}

function removeCompanyFromForm(companyId) {
  formData.value.companyIds = formData.value.companyIds.filter(id => id !== companyId)
}

async function addCompany(userId, role) {
  const user = users.value.find(u => u._id === userId)
  const company = findCompanyByText(addCompanyTexts.value[userId], availableForUser(user))

  if (!company) {
    formError.value = 'Empresa no encontrada o ya asignada. Si no existe, registrala primero en el panel de empresas.'
    return
  }

  try {
    const res = await fetch(`${API}/users/${userId}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
      body: JSON.stringify({ companyId: company._id, role: role === 'admin' ? 'contador' : role })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message)
    }
    addCompanyTexts.value[userId] = ''
    formSuccess.value = 'Empresa asignada'
    loadUsers()
  } catch (err) {
    formError.value = err.message || 'No se pudo asignar la empresa'
  }
}

async function removeCompany(userId, companyId) {
  if (!confirm('Quitar esta empresa al usuario?')) return
  try {
    const res = await fetch(`${API}/users/${userId}/companies/${companyId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (!res.ok) throw new Error('No se pudo quitar la empresa')
    formSuccess.value = 'Empresa removida'
    loadUsers()
  } catch (err) {
    formError.value = err.message
  }
}

function availableForUser(user) {
  const asignadas = new Set((user.companies || []).map(c => String(c._id)))
  return companies.value.filter(c => !asignadas.has(String(c._id)))
}

function resetForm() {
  formData.value = {
    email: '', name: '', telefono: '', password: '', role: 'contador', companyIds: []
  }
  companySearch.value = ''
}

function getRoleLabel(role) {
  return { admin: 'Administrador', contador: 'Contador', dueno: 'Dueno' }[role] || role
}

function getRoleBadgeClass(role) {
  return {
    admin: 'bg-red-900/50 text-red-400',
    contador: 'bg-blue-900/50 text-blue-400',
    dueno: 'bg-green-900/50 text-green-400'
  }[role] || 'bg-gray-700 text-gray-300'
}
</script>
