<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Periodos contables</h1>
        <p class="mt-2 text-sm text-gray-700">
          Crea el periodo del mes en el que vas a trabajar y ciérralo cuando termines de registrar todo.
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          type="button"
          @click="showNewPeriodModal = true"
          class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo periodo
        </button>
      </div>
    </div>

    <!-- Mensaje de error general -->
    <div v-if="periodStore.error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ periodStore.error }}
    </div>

    <!-- Cargando -->
    <div v-if="periodStore.loading && periodStore.periods.length === 0" class="text-center py-12 text-gray-500 text-sm">
      Cargando periodos...
    </div>

    <!-- Sin periodos -->
    <div
      v-else-if="periodStore.periods.length === 0"
      class="text-center py-12 bg-white rounded-lg ring-1 ring-gray-900/5"
    >
      <p class="text-gray-500 text-sm">Todavía no has creado ningún periodo.</p>
      <button
        type="button"
        @click="showNewPeriodModal = true"
        class="mt-3 text-blue-600 hover:text-blue-700 text-sm font-semibold"
      >
        Crear el primero
      </button>
    </div>

    <!-- Tabla de periodos -->
    <div v-else class="bg-white rounded-lg ring-1 ring-gray-900/5 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Periodo</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
            <th class="text-right px-4 py-3 font-semibold text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="period in orderedPeriods" :key="period._id">
            <td class="px-4 py-3 text-gray-900 font-medium">{{ periodName(period) }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="period.status === 'abierto'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-600'"
              >
                {{ period.status === 'abierto' ? 'Abierto' : 'Cerrado' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="period.status === 'abierto'"
                type="button"
                :disabled="closingId === period._id"
                @click="confirmClose(period)"
                class="text-red-600 hover:text-red-700 disabled:opacity-50 text-sm font-semibold"
              >
                {{ closingId === period._id ? 'Cerrando...' : 'Cerrar periodo' }}
              </button>
              <span v-else class="text-gray-400 text-sm">
                Cerrado {{ period.closedAt ? formatDate(period.closedAt) : '' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal nuevo periodo (ya existía en el proyecto) -->
    <PeriodModal :isOpen="showNewPeriodModal" @close="showNewPeriodModal = false" @created="onPeriodCreated" />

    <!-- Modal confirmar cierre de periodo -->
    <BaseModal v-model="showCloseModal" title="Cerrar periodo" size="sm" @close="showCloseModal = false">
      <p class="text-sm text-gray-700">
        ¿Cerrar el periodo <strong>{{ periodToClose ? periodName(periodToClose) : '' }}</strong>?
      </p>
      <p class="mt-2 text-sm text-gray-500">
        Una vez cerrado no se podrán registrar más transacciones ni compras en él.
      </p>

      <template #footer>
        <button
          type="button"
          @click="showCloseModal = false"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="closingId === periodToClose?._id"
          @click="handleClose"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
        >
          {{ closingId === periodToClose?._id ? 'Cerrando...' : 'Cerrar periodo' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeriodStore } from '@/stores/periods'
import PeriodModal from '@/components/periods/Periodmodal.vue'
import BaseModal from '@/components/common/BaseModal.vue'

const periodStore = usePeriodStore()
const showNewPeriodModal = ref(false)
const showCloseModal = ref(false)
const periodToClose = ref(null)
const closingId = ref(null)

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Más reciente primero
const orderedPeriods = computed(() => {
  return [...periodStore.periods].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })
})

function periodName(period) {
  return `${meses[period.month - 1]} ${period.year}`
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-HN')
}

function onPeriodCreated() {
  // El modal emite 'created', volvemos a cargar para reflejar el estado real del servidor
  periodStore.fetchPeriods()
}

function confirmClose(period) {
  periodToClose.value = period
  showCloseModal.value = true
}

async function handleClose() {
  if (!periodToClose.value) return
  const id = periodToClose.value._id
  closingId.value = id
  try {
    await periodStore.closePeriod(id)
    showCloseModal.value = false
    periodToClose.value = null
  } catch (err) {
    // El error ya queda en periodStore.error y se muestra arriba
  } finally {
    closingId.value = null
  }
}

onMounted(() => {
  periodStore.fetchPeriods()
})
</script>
