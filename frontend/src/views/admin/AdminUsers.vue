<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Gestión de usuarios"
        subtitle="Crea usuarios y asigna una o más empresas a cada uno."
      >
        <template #action>
          <router-link to="/admin">
            <BaseButton variant="outline">Volver al panel</BaseButton>
          </router-link>
        </template>
      </PageHeader>

      <!-- Crear usuario -->
      <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Crear nuevo usuario</h2>

        <div v-if="formError" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p class="text-sm text-amber-800">{{ formError }}</p>
        </div>
        <div v-if="formSuccess" class="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p class="text-sm text-emerald-700">{{ formSuccess }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input v-model="formData.email" type="email" placeholder="usuario@ledgerly.com"
              class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input v-model="formData.telefono" type="tel" placeholder="0000-0000"
              class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input v-model="formData.name" type="text" placeholder="Nombre completo"
              class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input v-model="formData.password" type="password" placeholder="********"
              class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select v-model="formData.role"
              class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="contador">Contador</option>
              <option value="dueno">Dueño</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div v-if="formData.role !== 'admin'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Empresas asignadas
              <span class="text-gray-500 text-xs">(marca una o más)</span>
            </label>
            <div class="border border-gray-300 rounded-md bg-white px-3 py-2 max-h-32 overflow-y-auto">
              <label v-for="c in companies" :key="c._id"
                class="flex items-center gap-2 py-1 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" :value="c._id" v-model="formData.companyIds"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                {{ c.name }}
              </label>
              <p v-if="companies.length === 0" class="text-xs text-gray-500 py-1">
                No hay empresas registradas todavía.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5 flex gap-2">
          <BaseButton variant="primary" :loading="loading" @click="createUser">
            {{ loading ? 'Creando' : 'Crear usuario' }}
          </BaseButton>
          <BaseButton variant="outline" @click="resetForm">
            Limpiar
          </BaseButton>
        </div>
      </div>

      <!-- Tabla usuarios -->
      <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Usuarios registrados</h2>

        <div v-if="loadingUsers" class="text-center py-8 text-sm text-gray-500">
          Cargando usuarios...
        </div>
        <EmptyState v-else-if="users.length === 0" icon="users" message="No hay usuarios registrados todavía." />

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Correo</th>
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</th>
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Rol</th>
                <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Empresas</th>
                <th class="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u._id" class="border-b border-gray-100 hover:bg-gray-50 align-top transition-colors duration-200">
                <td class="py-3 px-4 text-gray-700">{{ u.email }}</td>
                <td class="py-3 px-4 text-gray-700">{{ u.name }}</td>
                <td class="py-3 px-4">
                  <span :class="getRoleBadgeClass(u.role)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset">
                    {{ getRoleLabel(u.role) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div v-if="u.role === 'admin'" class="text-gray-400 text-xs italic">Administrador global</div>
                  <div v-else class="space-y-1">
                    <div v-for="c in u.companies" :key="c._id" class="flex items-center gap-2">
                      <span class="text-sm text-gray-700">{{ c.name }}</span>
                      <span class="text-xs text-gray-400">({{ getRoleLabel(c.role) }})</span>
                      <button @click="removeCompany(u._id, c._id)"
                        class="text-xs text-gray-400 hover:text-danger transition-colors duration-200" title="Quitar empresa">
                        Quitar
                      </button>
                    </div>
                    <div class="flex items-center gap-2 mt-1" v-if="availableForUser(u).length > 0">
                      <select v-model="addSelections[u._id]"
                        class="text-xs bg-white border border-gray-300 rounded px-2 py-1 text-gray-700 focus:ring-1 focus:ring-primary-500">
                        <option value="">+ Agregar empresa...</option>
                        <option v-for="c in availableForUser(u)" :key="c._id" :value="c._id">
                          {{ c.name }}
                        </option>
                      </select>
                      <button v-if="addSelections[u._id]" @click="addCompany(u._id, u.role)"
                        class="text-xs text-primary-600 hover:text-primary-700 font-semibold">
                        Guardar
                      </button>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 text-right">
                  <button @click="deleteUser(u._id)" :disabled="loading"
                    class="text-sm text-gray-400 hover:text-danger disabled:opacity-50 transition-colors duration-200">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

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
const addSelections = ref({})
const loading = ref(false)
const loadingUsers = ref(false)
const formError = ref('')
const formSuccess = ref('')

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
    const res = await fetch(`${API}/companies`, { headers: { Authorization: `Bearer ${authStore.token}` } })
    if (res.ok) {
      const data = await res.json()
      companies.value = data.data || []
    }
  } catch (err) { console.error(err) }
}

async function loadUsers() {
  loadingUsers.value = true
  try {
    const response = await fetch(`${API}/users`, { headers: { Authorization: `Bearer ${authStore.token}` } })
    if (!response.ok) throw new Error('Error al cargar usuarios')
    const data = await response.json()
    users.value = data.data || []
  } catch (error) {
    formError.value = 'Error al cargar usuarios'
  } finally {
    loadingUsers.value = false
  }
}

async function createUser() {
  formError.value = ''
  formSuccess.value = ''
  if (!formData.value.email || !formData.value.name || !formData.value.password) {
    formError.value = 'Correo, nombre y contraseña son requeridos'
    return
  }
  if (formData.value.role !== 'admin' && formData.value.companyIds.length === 0) {
    formError.value = 'Selecciona al menos una empresa para contador o dueño'
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
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return
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

async function addCompany(userId, role) {
  const companyId = addSelections.value[userId]
  if (!companyId) return
  try {
    const res = await fetch(`${API}/users/${userId}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
      body: JSON.stringify({ companyId, role: role === 'admin' ? 'contador' : role })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message)
    }
    addSelections.value[userId] = ''
    formSuccess.value = 'Empresa asignada'
    loadUsers()
  } catch (err) {
    formError.value = err.message || 'No se pudo asignar la empresa'
  }
}

async function removeCompany(userId, companyId) {
  if (!confirm('¿Quitar esta empresa al usuario?')) return
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
  formData.value = { email: '', name: '', telefono: '', password: '', role: 'contador', companyIds: [] }
}

function getRoleLabel(role) {
  return { admin: 'Administrador', contador: 'Contador', dueno: 'Dueño' }[role] || role
}

function getRoleBadgeClass(role) {
  return {
    admin: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    contador: 'bg-primary-50 text-primary-700 ring-primary-600/20',
    dueno: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  }[role] || 'bg-gray-50 text-gray-700 ring-gray-500/20'
}
</script>
