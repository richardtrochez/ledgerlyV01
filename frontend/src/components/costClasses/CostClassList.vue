<template>
  <div class="space-y-4">
    <!-- Búsqueda -->
    <div class="flex items-center justify-between">
      <div class="w-full sm:w-96">
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar clase de costo..."
            class="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
        </div>
      </div>

      <select
        v-model="filterStatus"
        class="rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
      >
        <option value="">Todos los estados</option>
        <option value="active">Activas</option>
        <option value="inactive">Inactivas</option>
      </select>
    </div>

    <!-- Tabla -->
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-gray-50">
          <tr>
            <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre</th>
            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Descripción</th>
            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cuentas</th>
            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
            <th class="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="loading" class="text-center">
            <td colspan="5" class="py-8">
              <LoadingSpinner />
            </td>
          </tr>
          <tr v-else-if="filteredCostClasses.length === 0" class="text-center">
            <td colspan="5" class="py-8 text-sm text-gray-500">
              No se encontraron clases de costo
            </td>
          </tr>
          <tr v-else v-for="costClass in filteredCostClasses" :key="costClass._id" class="hover:bg-gray-50">
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {{ costClass.name }}
            </td>
            <td class="px-3 py-4 text-sm text-gray-700">
              <div class="max-w-xs truncate">
                {{ costClass.description || '-' }}
              </div>
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              {{ getAccountCount(costClass.name) }} cuenta(s)
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm">
              <span :class="costClass.isActive ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'" class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset">
                {{ costClass.isActive ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <button
                @click="$emit('edit', costClass)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                Editar
              </button>
              <button
                @click="confirmDelete(costClass)"
                class="text-red-600 hover:text-red-900"
                :disabled="getAccountCount(costClass.name) > 0"
                :class="{ 'opacity-50 cursor-not-allowed': getAccountCount(costClass.name) > 0 }"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmación -->
    <BaseModal :show="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">Eliminar Clase de Costo</h3>
      </template>
      <div class="space-y-4">
        <p class="text-sm text-gray-700">
          ¿Está seguro que desea eliminar la clase de costo <strong>{{ costClassToDelete?.name }}</strong>?
        </p>
        <p class="text-sm text-red-600" v-if="getAccountCount(costClassToDelete?.name) > 0">
          ⚠️ Esta clase tiene {{ getAccountCount(costClassToDelete?.name) }} cuenta(s) asociada(s). No se puede eliminar.
        </p>
        <p class="text-sm text-yellow-600" v-else>
          ⚠️ Esta acción no se puede deshacer.
        </p>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="outline" @click="showDeleteModal = false">
            Cancelar
          </BaseButton>
          <BaseButton
            variant="danger"
            @click="handleDelete"
            :loading="deleting"
            :disabled="getAccountCount(costClassToDelete?.name) > 0"
            class="bg-red-600 hover:bg-red-700 text-white"
          >
            Eliminar
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const props = defineProps({
  costClasses: {
    type: Array,
    required: true
  },
  accounts: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete'])

const searchQuery = ref('')
const filterStatus = ref('')

const showDeleteModal = ref(false)
const costClassToDelete = ref(null)
const deleting = ref(false)

const filteredCostClasses = computed(() => {
  let result = props.costClasses

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(costClass =>
      costClass.name.toLowerCase().includes(query) ||
      (costClass.description && costClass.description.toLowerCase().includes(query))
    )
  }

  // Filtrar por estado
  if (filterStatus.value === 'active') {
    result = result.filter(costClass => costClass.isActive)
  } else if (filterStatus.value === 'inactive') {
    result = result.filter(costClass => !costClass.isActive)
  }

  return result
})

const getAccountCount = (costClassName) => {
  if (!costClassName) return 0
  return props.accounts.filter(account => account.subgroup === costClassName).length
}

const confirmDelete = (costClass) => {
  if (getAccountCount(costClass.name) > 0) {
    return
  }
  costClassToDelete.value = costClass
  showDeleteModal.value = true
}

const handleDelete = async () => {
  deleting.value = true
  try {
    await emit('delete', costClassToDelete.value._id)
    showDeleteModal.value = false
    costClassToDelete.value = null
  } finally {
    deleting.value = false
  }
}
</script>
