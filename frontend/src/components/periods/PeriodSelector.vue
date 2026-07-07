<template>
  <div class="flex items-center gap-4">
    <!-- Selector de período -->
    <div class="flex-1">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Período activo
      </label>
      <div class="flex gap-2">
        <select
          v-model="selectedPeriodId"
          class="flex-1 px-4 py-2.5 border-2 border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium text-gray-900"
          @change="handlePeriodChange"
        >
          <option value="" disabled>Seleccione un período</option>
          <option
            v-for="period in periodStore.periods"
            :key="period._id"
            :value="period._id"
          >
            {{ period.periodName || `${getMonthName(period.month)} ${period.year}` }}
            <template v-if="period.status === 'cerrado'"> (Cerrado)</template>
          </option>
        </select>

        <BaseButton
          variant="primary"
          @click="showCreateModal = true"
        >
          <template #icon>
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </template>
          Nuevo período
        </BaseButton>
      </div>
    </div>

    <!-- Badge de Estado -->
    <div v-if="periodStore.currentPeriod" class="flex flex-col items-end">
      <span class="text-xs font-medium text-gray-500 mb-1">Estado</span>
      <span :class="statusBadgeClasses">
        {{ periodStore.currentPeriod.status === 'abierto' ? 'Abierto' : 'Cerrado' }}
      </span>
    </div>
  </div>

  <!-- Modal: crear período -->
  <BaseModal
    v-model="showCreateModal"
    title="Crear nuevo período"
    size="md"
  >
    <form @submit.prevent="handleCreatePeriod" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <!-- Mes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mes <span class="text-danger">*</span>
          </label>
          <select
            v-model.number="newPeriod.month"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="" disabled>Seleccione mes</option>
            <option v-for="(month, index) in months" :key="index" :value="index + 1">
              {{ month }}
            </option>
          </select>
        </div>

        <!-- Año -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Año <span class="text-danger">*</span>
          </label>
          <select
            v-model.number="newPeriod.year"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="" disabled>Seleccione año</option>
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="newPeriod.month && newPeriod.year" class="p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <p class="text-sm text-gray-700">
          <strong>Período a crear:</strong> {{ months[newPeriod.month - 1] }} {{ newPeriod.year }}
        </p>
      </div>

      <!-- Error -->
      <p v-if="error" class="text-sm text-danger">{{ error }}</p>
    </form>

    <template #footer>
      <BaseButton
        variant="secondary"
        @click="showCreateModal = false"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        :loading="creating"
        @click="handleCreatePeriod"
      >
        Crear período
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePeriodStore } from '@/stores/periods'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'

const emit = defineEmits(['period-changed'])

const periodStore = usePeriodStore()

// State
const selectedPeriodId = ref('')
const showCreateModal = ref(false)
const creating = ref(false)
const error = ref(null)

const newPeriod = ref({
  month: '',
  year: new Date().getFullYear()
})

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Cálculos
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
})

const statusBadgeClasses = computed(() => {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold'
  return periodStore.currentPeriod?.status === 'abierto'
    ? `${base} bg-success-light text-success-dark border border-success`
    : `${base} bg-gray-200 text-gray-700 border border-gray-300`
})

// Métodos
function getMonthName(month) {
  return months[month - 1]
}

function handlePeriodChange() {
  const period = periodStore.periods.find(p => p._id === selectedPeriodId.value)
  if (period) {
    periodStore.setCurrentPeriod(period)
    emit('period-changed', period)
  }
}

async function handleCreatePeriod() {
  if (!newPeriod.value.month || !newPeriod.value.year) {
    error.value = 'Debe seleccionar mes y año'
    return
  }

  creating.value = true
  error.value = null

  try {
    await periodStore.createPeriod({
      month: newPeriod.value.month,
      year: newPeriod.value.year
    })

    showCreateModal.value = false
    newPeriod.value = {
      month: '',
      year: new Date().getFullYear()
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al crear período'
  } finally {
    creating.value = false
  }
}

// Watchers
watch(() => periodStore.currentPeriod, (newPeriod) => {
  if (newPeriod) {
    selectedPeriodId.value = newPeriod._id
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  if (periodStore.periods.length === 0) {
    await periodStore.fetchPeriods()
  }
})
</script>
