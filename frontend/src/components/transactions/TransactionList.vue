<template>
  <div class="space-y-4">
   
   
   
    <!-- Filtros -->
    <BaseCard>
      <div class="flex flex-wrap gap-4 items-end">
        <!-- Filtro por periodo -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Periodo
          </label>
          <select
            v-model="filters.periodId"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @change="applyFilters"
          >
            <option value="">Todos los periodos</option>
            <option
              v-for="period in periodStore.periods"
              :key="period._id"
              :value="period._id"
            >
              {{ period.periodName || `${getMonthName(period.month)} ${period.year}` }}
            </option>
          </select>
        </div>

        <!-- Filtro por tipo -->
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            v-model="filters.type"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @change="applyFilters"
          >
            <option value="">Todos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
        </div>

        <!-- Botón limpiar filtros -->
        <BaseButton
          variant="secondary"
          @click="clearFilters"
        >
          Limpiar
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Tabla de transacciones -->
    <BaseCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900">
            Transacciones
            <span class="text-sm font-normal text-gray-500 ml-2">
              ({{ filteredCount }} registros)
            </span>
          </h3>
        </div>
      </template>

      <!-- Loading State -->
      <LoadingSpinner v-if="loading" center text="Cargando transacciones..." />

      <!-- Empty State -->
      <div v-else-if="transactions.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay transacciones</h3>
        <p class="mt-1 text-sm text-gray-500">Comienza registrando una nueva transacción.</p>
      </div>

      <!-- Tabla -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cuenta
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="transaction in transactions"
              :key="transaction._id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="typeBadgeClasses(transaction.type)">
                  {{ transaction.type === 'ingreso' ? 'Ingreso' : 'Egreso' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="font-medium text-gray-900">{{ transaction.accountName }}</div>
                <div class="text-gray-500">{{ transaction.accountCode }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {{ transaction.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <span :class="amountClasses(transaction.type)">
                  {{ formatCurrency(transaction.amount) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div class="flex justify-end gap-2">
                  <button
                    @click="emit('edit', transaction)"
                    class="text-primary-600 hover:text-primary-900 transition-colors"
                    title="Editar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(transaction)"
                    class="text-danger hover:text-danger-dark transition-colors"
                    title="Eliminar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <!-- Modal de confirmación de eliminación -->
    <BaseModal
      v-model="showDeleteModal"
      title="Confirmar Eliminación"
      size="sm"
    >
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-light mb-4">
          <svg class="h-6 w-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">¿Eliminar transacción?</h3>
        <p class="text-sm text-gray-500 mb-4">
          Esta acción no se puede deshacer.
        </p>
        <div v-if="transactionToDelete" class="bg-gray-50 p-3 rounded-lg text-left mb-4">
          <p class="text-sm"><strong>Fecha:</strong> {{ formatDate(transactionToDelete.date) }}</p>
          <p class="text-sm"><strong>Cuenta:</strong> {{ transactionToDelete.accountName }}</p>
          <p class="text-sm"><strong>Monto:</strong> {{ formatCurrency(transactionToDelete.amount) }}</p>
        </div>
      </div>

      <template #footer>
        <BaseButton
          variant="secondary"
          @click="showDeleteModal = false"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="danger"
          :loading="deleting"
          @click="handleDelete"
        >
          Eliminar
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeriodStore } from '@/stores/periods'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'


  


const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'filter'])

const periodStore = usePeriodStore()

// State
const filters = ref({
  periodId: '',
  type: ''
})

const showDeleteModal = ref(false)
const transactionToDelete = ref(null)
const deleting = ref(false)

// Computed
const filteredCount = computed(() => props.transactions.length)

// Methods
function getMonthName(month) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return months[month - 1]
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(amount)
}

function typeBadgeClasses(type) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  return type === 'ingreso'
    ? `${base} bg-success-light text-success-dark`
    : `${base} bg-danger-light text-danger-dark`
}

function amountClasses(type) {
  const base = 'text-sm font-semibold'
  return type === 'ingreso'
    ? `${base} text-success`
    : `${base} text-danger`
}

function applyFilters() {
  emit('filter', { ...filters.value })
}

function clearFilters() {
  filters.value = {
    periodId: '',
    type: '',
  }
  applyFilters()
}

function confirmDelete(transaction) {
  transactionToDelete.value = transaction
  showDeleteModal.value = true
}

async function handleDelete() {
  deleting.value = true
  try {
    await emit('delete', transactionToDelete.value._id)
    showDeleteModal.value = false
    transactionToDelete.value = null
  } finally {
    deleting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (periodStore.periods.length === 0) {
    await periodStore.fetchPeriods()
  }
  
  // Establecer el periodo actual como filtro por defecto
  if (periodStore.currentPeriod) {
    filters.value.periodId = periodStore.currentPeriod._id
    applyFilters()
  }
})
</script>
