<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Panel de administración"
        :subtitle="`Hola ${userName}. Gestiona empresas y usuarios de la plataforma.`"
      >
        <template #action>
          <BaseButton variant="outline" @click="logout">
            Cerrar sesión
          </BaseButton>
        </template>
      </PageHeader>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-5">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
              <BuildingOfficeIcon class="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900">Registrar empresas</h2>
              <p class="text-sm text-gray-500 mt-0.5">Crear las empresas que luego se asignan a los contadores</p>
            </div>
          </div>
          <router-link to="/admin/empresas">
            <BaseButton variant="primary" block>Ir a empresas</BaseButton>
          </router-link>
        </div>

        <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-5">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
              <UsersIcon class="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900">Gestión de usuarios</h2>
              <p class="text-sm text-gray-500 mt-0.5">Crear usuarios y enlazar empresas a cada contador</p>
            </div>
          </div>
          <router-link to="/admin/usuarios">
            <BaseButton variant="primary" block>Ir a usuarios</BaseButton>
          </router-link>
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
import { BuildingOfficeIcon, UsersIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const userName = ref('Administrador')

onMounted(() => {
  if (authStore.user?.role !== 'admin') {
    router.push('/dashboard')
    return
  }
  userName.value = authStore.user?.name || 'Administrador'
})

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
