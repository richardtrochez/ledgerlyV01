<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Card: Total Ingresos -->
    <BaseCard hoverable shadow="normal">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-600 mb-1">Total Ingresos</p>
          <p class="text-3xl font-bold text-success">
            {{ formatCurrency(summary.totalIngresos) }}
          </p>
          <p class="text-sm text-gray-500 mt-2">
            {{ summary.cantidadIngresos }} transacción(es)
          </p>
        </div>
        <div class="p-3 bg-success-light rounded-lg">
          <svg class="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mt-4">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-success h-2 rounded-full transition-all duration-500"
            :style="{ width: ingresosPercentage + '%' }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">{{ ingresosPercentage }}% del total</p>
      </div>
    </BaseCard>

    <!-- Card: Total Egresos -->
    <BaseCard hoverable shadow="normal">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-600 mb-1">Total Egresos</p>
          <p class="text-3xl font-bold text-danger">
            {{ formatCurrency(summary.totalEgresos) }}
          </p>
          <p class="text-sm text-gray-500 mt-2">
            {{ summary.cantidadEgresos }} transacción(es)
          </p>
        </div>
        <div class="p-3 bg-danger-light rounded-lg">
          <svg class="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mt-4">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-danger h-2 rounded-full transition-all duration-500"
            :style="{ width: egresosPercentage + '%' }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">{{ egresosPercentage }}% del total</p>
      </div>
    </BaseCard>

    <!-- Card: Resultado (Ingresos - Egresos) -->
    <BaseCard hoverable shadow="normal" :class="resultadoCardClass">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-600 mb-1">Resultado del Periodo</p>
          <p :class="resultadoAmountClass">
            {{ formatCurrency(summary.resultado) }}
          </p>
          <p class="text-sm text-gray-500 mt-2">
            {{ summary.totalTransacciones }} transacción(es) total
          </p>
        </div>
        <div :class="resultadoIconContainerClass">
          <svg v-if="summary.resultado >= 0" class="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <svg v-else class="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        </div>
      </div>

      <!-- Estado -->
      <div class="mt-4">
        <div :class="resultadoStatusClass">
          <svg v-if="summary.resultado >= 0" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium">
            {{ summary.resultado >= 0 ? 'Superávit' : 'Déficit' }}
          </span>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({
      totalIngresos: 0,
      totalEgresos: 0,
      resultado: 0,
      cantidadIngresos: 0,
      cantidadEgresos: 0,
      totalTransacciones: 0
    })
  }
})

// Computed
const totalMovimientos = computed(() => {
  return props.summary.totalIngresos + props.summary.totalEgresos
})

const ingresosPercentage = computed(() => {
  if (totalMovimientos.value === 0) return 0
  return Math.round((props.summary.totalIngresos / totalMovimientos.value) * 100)
})

const egresosPercentage = computed(() => {
  if (totalMovimientos.value === 0) return 0
  return Math.round((props.summary.totalEgresos / totalMovimientos.value) * 100)
})

const resultadoCardClass = computed(() => {
  return props.summary.resultado >= 0
    ? 'border-l-4 border-success'
    : 'border-l-4 border-danger'
})

const resultadoAmountClass = computed(() => {
  const base = 'text-3xl font-bold'
  return props.summary.resultado >= 0
    ? `${base} text-success`
    : `${base} text-danger`
})

const resultadoIconContainerClass = computed(() => {
  return props.summary.resultado >= 0
    ? 'p-3 bg-success-light rounded-lg'
    : 'p-3 bg-danger-light rounded-lg'
})

const resultadoStatusClass = computed(() => {
  const base = 'flex items-center px-3 py-2 rounded-lg font-medium text-sm'
  return props.summary.resultado >= 0
    ? `${base} bg-success-light text-success-dark`
    : `${base} bg-danger-light text-danger-dark`
})

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(amount)
}
</script>
