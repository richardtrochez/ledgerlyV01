<template>
  <div class="space-y-4">
    <!-- Filtros y búsqueda -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <!-- Búsqueda -->
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
            placeholder="Buscar por código o nombre..."
            class="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex gap-2">
        <select
          v-model="filterGroup"
          class="rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
        >
          <option value="">Todos los grupos</option>
          <option value="ingreso">Ingresos</option>
          <option value="gasto_operativo">Gastos operativos</option>
          <option value="costo_directo">Costos directos</option>
          <option value="otros">Otros</option>
        </select>

        <select
          v-model="filterStatus"
          class="rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-gray-50">
          <tr>
            <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Código</th>
            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nombre</th>
            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Grupo</th>
            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Clase de costo</th>
            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
            <th class="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="loading" class="text-center">
            <td colspan="6" class="py-8">
              <LoadingSpinner />
            </td>
          </tr>
          <tr v-else-if="filteredAccounts.length === 0" class="text-center">
            <td colspan="6" class="py-8 text-sm text-gray-500">
              No se encontraron cuentas
            </td>
          </tr>
          <tr v-else v-for="account in paginatedAccounts" :key="account._id" class="hover:bg-gray-50">
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {{ account.code }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
              {{ account.name }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm">
              <span :class="groupBadgeClass(account.group)" class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium">
                {{ groupLabel(account.group) }}
              </span>
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              {{ account.subgroup || '-' }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm">
              <span :class="account.isActive ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'" class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset">
                {{ account.isActive ? 'Activa' : 'Inactiva' }}
              </span>
            </td>


            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <button
                @click="$emit('edit', account)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                Editar
              </button>
          
<button
  @click="$emit('toggle', account._id)"
  class="mr-4"
  :class="account.isActive ? 'text-amber-600 hover:text-amber-900' : 'text-emerald-600 hover:text-emerald-900'"
>
  {{ account.isActive ? 'Desactivar' : 'Activar' }}
</button>
<button
  @click="confirmDelete(account)"
  class="text-red-600 hover:text-red-900"
>
  Eliminar
</button>

</td>
</tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando
              <span class="font-medium">{{ startItem }}</span>
              a
              <span class="font-medium">{{ endItem }}</span>
              de
              <span class="font-medium">{{ filteredAccounts.length }}</span>
              cuentas
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <span class="sr-only">Anterior</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </button>
              <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <span class="sr-only">Siguiente</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <BaseModal :show="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">Eliminar cuenta</h3>
      </template>
      <div class="space-y-4">
        <p class="text-sm text-gray-700">
          ¿Está seguro que desea eliminar la cuenta <strong>{{ accountToDelete?.code }} - {{ accountToDelete?.name }}</strong>?
        </p>
        <p class="text-sm text-red-600">
           Esta acción no se puede deshacer. Las transacciones asociadas a esta cuenta quedarán huérfanas.
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
  accounts: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle'])

const searchQuery = ref('')
const filterGroup = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const showDeleteModal = ref(false)
const accountToDelete = ref(null)
const deleting = ref(false)

const filteredAccounts = computed(() => {
  let result = props.accounts

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(account =>
      account.code.toLowerCase().includes(query) ||
      account.name.toLowerCase().includes(query)
    )
  }

  // Filtrar por grupo
  if (filterGroup.value) {
    result = result.filter(account => account.group === filterGroup.value)
  }

  // Filtrar por estado
  if (filterStatus.value === 'active') {
    result = result.filter(account => account.isActive)
  } else if (filterStatus.value === 'inactive') {
    result = result.filter(account => !account.isActive)
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredAccounts.value.length / itemsPerPage))
const startItem = computed(() => (currentPage.value - 1) * itemsPerPage + 1)
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage, filteredAccounts.value.length))

const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAccounts.value.slice(start, end)
})

const groupLabel = (group) => {
  const labels = {
    'ingreso': 'Ingreso',
    'costo_directo': 'Costo directo',
    'gasto_operativo': 'Gasto operativo',
    'otros': 'Otros'
  }
  return labels[group] || group
}

const groupBadgeClass = (group) => {
  const classes = {
    'ingreso': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'costo_directo': 'bg-orange-50 text-orange-700 ring-orange-600/20',
    'gasto_operativo': 'bg-rose-50 text-rose-700 ring-rose-600/20',
    'otros': 'bg-gray-50 text-gray-700 ring-gray-600/20'
  }
  return classes[group] || 'bg-gray-50 text-gray-700 ring-gray-600/20'
}

const confirmDelete = (account) => {
  accountToDelete.value = account
  showDeleteModal.value = true
}

const handleDelete = async () => {
  deleting.value = true
  try {
    await emit('delete', accountToDelete.value._id)
    showDeleteModal.value = false
    accountToDelete.value = null
  } finally {
    deleting.value = false
  }
}
</script>
