<template>
  <div class="min-h-screen bg-gray-900">
    <div class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-white">Panel de Administracion</h1>
          <button
            @click="logout"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Cerrar Sesion
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-bold text-white mb-4">Registrar Empresas</h2>
          <p class="text-gray-400 mb-4">Crear las empresas que luego se asignan a los contadores</p>
          <router-link
            to="/admin/empresas"
            class="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Ir a Empresas
          </router-link>
        </div>

        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-bold text-white mb-4">Gestion de Usuarios</h2>
          <p class="text-gray-400 mb-4">Crear usuarios y enlazar empresas a cada contador</p>
          <router-link
            to="/admin/usuarios"
            class="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Ir a Usuarios
          </router-link>
        </div>

        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-bold text-white mb-4">Informacion Empresa</h2>
          <p class="text-gray-400 mb-4">Ver informacion de la empresa</p>
          <div class="bg-gray-700 rounded p-3 mb-4">
            <p class="text-sm text-gray-300">
              <span class="font-semibold">ID Empresa:</span> {{ companyLabel }}
            </p>
            <p class="text-sm text-gray-300 mt-1">
              <span class="font-semibold">Usuario:</span> {{ userName }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const userName = ref('Admin')
const companyLabel = computed(() => authStore.companyId || 'Sin empresa asignada')

onMounted(() => {
  if (authStore.user?.role !== 'admin') {
    router.push('/dashboard')
    return
  }

  userName.value = authStore.user?.name || 'Admin'
})

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
