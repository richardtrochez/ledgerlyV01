<template>
  <div class="min-h-screen bg-gray-900">
    <div class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div>
          <router-link
            to="/admin"
            class="text-indigo-400 hover:text-indigo-300 mb-2 inline-block"
          >
            Volver a Panel
          </router-link>
          <h1 class="text-3xl font-bold text-white">Gestion de Usuarios</h1>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <input
              v-model="formData.email"
              type="email"
              placeholder="usuario@ledgerly.com"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Telefono</label>
            <input
              v-model="formData.telefono"
              type="tel"
              placeholder="0000-0000"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="Nombre completo"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Contrasena</label>
            <input
              v-model="formData.password"
              type="password"
              placeholder="********"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Rol</label>
            <select
              v-model="formData.role"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="contador">Contador</option>
              <option value="dueno">Dueno</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button
            @click="createUser"
            :disabled="loading"
            class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-md font-medium"
          >
            {{ loading ? 'Creando...' : 'Crear Usuario' }}
          </button>
          <button
            @click="resetForm"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium"
          >
            Limpiar
          </button>
        </div>
      </div>

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
                <th class="text-center py-3 px-4 font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user._id" class="border-b border-gray-700 hover:bg-gray-700/50">
                <td class="py-3 px-4 text-gray-300">{{ user.email }}</td>
                <td class="py-3 px-4 text-gray-300">{{ user.name }}</td>
                <td class="py-3 px-4">
                  <span :class="getRoleBadgeClass(user.role)" class="inline-block px-2 py-1 rounded text-xs font-semibold">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <button
                    @click="deleteUser(user._id)"
                    :disabled="loading"
                    class="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                  >
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

const router = useRouter()
const authStore = useAuthStore()
const API = 'http://localhost:4000/api'

const formData = ref({
  email: '',
  name: '',
  telefono: '',
  password: '',
  role: 'contador'
})

const users = ref([])
const loading = ref(false)
const loadingUsers = ref(false)
const formError = ref('')
const formSuccess = ref('')

onMounted(() => {
  if (authStore.user?.role !== 'admin') {
    router.push('/dashboard')
    return
  }

  loadUsers()
})

async function loadUsers() {
  loadingUsers.value = true
  try {
    const response = await fetch(`${API}/users`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      throw new Error('Error al cargar usuarios')
    }

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
    formError.value = 'Todos los campos son requeridos'
    return
  }

  loading.value = true
  try {
    const response = await fetch(`${API}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        email: formData.value.email,
        name: formData.value.name,
        telefono: formData.value.telefono,
        password: formData.value.password,
        role: formData.value.role,
        companyId: authStore.companyId || undefined
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al crear usuario')
    }

    formSuccess.value = 'Usuario creado exitosamente'
    resetForm()
    loadUsers()
  } catch (error) {
    console.error('Error:', error)
    formError.value = error.message || 'Error al crear usuario'
  } finally {
    loading.value = false
  }
}

async function deleteUser(userId) {
  if (!confirm('Estas seguro de que quieres eliminar este usuario?')) {
    return
  }

  loading.value = true
  try {
    const response = await fetch(`${API}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      throw new Error('Error al eliminar usuario')
    }

    formSuccess.value = 'Usuario eliminado exitosamente'
    loadUsers()
  } catch (error) {
    console.error('Error:', error)
    formError.value = 'Error al eliminar usuario'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formData.value = {
    email: '',
    name: '',
    telefono: '',
    password: '',
    role: 'contador'
  }
}

function getRoleLabel(role) {
  const labels = {
    admin: 'Administrador',
    contador: 'Contador',
    dueno: 'Dueno'
  }
  return labels[role] || role
}

function getRoleBadgeClass(role) {
  const classes = {
    admin: 'bg-red-900/50 text-red-400',
    contador: 'bg-blue-900/50 text-blue-400',
    dueno: 'bg-green-900/50 text-green-400'
  }
  return classes[role] || 'bg-gray-700 text-gray-300'
}
</script>
