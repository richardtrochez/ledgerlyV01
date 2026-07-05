<template>
  <div>
   <PageHeader
      title="Periodos contables"
      subtitle="Crea el periodo del mes que vas a trabajar y cierralo cuando termines de registrar todo."
    />

    <!-- Accion principal: al inicio, alineada con el contenido -->
    <div class="flex mb-6">
      <BaseButton variant="primary" @click="showNewPeriodModal = true">
        <template #icon><PlusIcon class="w-4 h-4" /></template>
        Nuevo periodo
      </BaseButton>
    </div>

    <!-- Mensaje de error -->
    <div v-if="periodStore.error" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
      {{ periodStore.error }}
    </div>

    <!-- Cargando -->
    <div v-if="periodStore.loading && periodStore.periods.length === 0" class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-8 text-center text-sm text-gray-500">
      Cargando periodos...
    </div>

    <!-- Vacio -->
    <div
      v-else-if="periodStore.periods.length === 0"
      class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5"
    >
      <EmptyState
        icon="folder"
        message="Todavia no has creado ningun periodo."
        action-label="Crear el primero"
        @action="showNewPeriodModal = true"
      />
    </div>

    <!-- Tabla -->
    <div v-else class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Periodo</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
            <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="period in orderedPeriods" :key="period._id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
            <td class="px-4 py-3 text-gray-900 font-medium">{{ periodName(period) }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="period.status === 'abierto'
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                  : 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10'"
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
                class="text-sm font-medium text-gray-400 hover:text-danger disabled:opacity-50 transition-colors duration-200"
              >
                {{ closingId === period._id ? 'Cerrando...' : 'Cerrar' }}
              </button>
              <span v-else class="text-gray-400 text-sm">
                Cerrado {{ period.closedAt ? formatDate(period.closedAt) : '' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PeriodModal :isOpen="showNewPeriodModal" @close="showNewPeriodModal = false" @created="onPeriodCreated" />

    <BaseModal v-model="showCloseModal" title="Cerrar periodo" size="sm" @close="showCloseModal = false">
      <p class="text-sm text-gray-700">
        Cerrar el periodo <strong>{{ periodToClose ? periodName(periodToClose) : '' }}</strong>?
      </p>
      <p class="mt-2 text-sm text-gray-500">
        Una vez cerrado no se podran registrar mas transacciones ni compras en el.
      </p>

      <template #footer>
        <BaseButton variant="outline" @click="showCloseModal = false">Cancelar</BaseButton>
        <BaseButton variant="danger" :loading="closingId === periodToClose?._id" @click="handleClose">
          Cerrar periodo
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeriodStore } from '@/stores/periods'
import PeriodModal from '@/components/periods/Periodmodal.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

const periodStore = usePeriodStore()
const showNewPeriodModal = ref(false)
const showCloseModal = ref(false)
const periodToClose = ref(null)
const closingId = ref(null)

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const orderedPeriods = computed(() => [...periodStore.periods].sort((a, b) => {
  if (a.year !== b.year) return b.year - a.year
  return b.month - a.month
}))

function periodName(period) { return `${meses[period.month - 1]} ${period.year}` }
function formatDate(dateString) { return new Date(dateString).toLocaleDateString('es-HN') }
function onPeriodCreated() { periodStore.fetchPeriods() }

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
    // error queda en periodStore.error
  } finally {
    closingId.value = null
  }
}

onMounted(() => { periodStore.fetchPeriods() })
</script>
