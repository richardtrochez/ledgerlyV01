<template>
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Estado de Resultados</h2>
        <p class="mt-2 text-sm text-gray-600">Resumen de ingresos y gastos por período</p>
      </div>

      <!-- Filtros -->
      <div class="mb-6 bg-white p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5">
        <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-tight">Año</label>
            <select
              v-model="selectedYear"
              @change="loadData"
              class="bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-tight">Desde</label>
            <select
              v-model="fromMonth"
              @change="loadData"
              class="bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option v-for="(month, idx) in monthNames" :key="idx" :value="idx + 1">
                {{ month }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-tight">Hasta</label>
            <select
              v-model="toMonth"
              @change="loadData"
              class="bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option v-for="(month, idx) in monthNames" :key="idx" :value="idx + 1">
                {{ month }}
              </option>
            </select>
          </div>

          <button
            @click="exportToExcel"
            :disabled="!transactions.length"
            class="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            :class="!transactions.length
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Excel
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-sm text-gray-600">Cargando datos...</p>
        </div>
      </div>

      <!-- Sin datos -->
      <div v-else-if="transactions.length === 0" class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-12 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No hay datos para este período</h3>
        <p class="mt-2 text-sm text-gray-500">Selecciona un período con transacciones</p>
      </div>

      <!-- Estado de Resultados -->
      <div v-else class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">Concepto</th>
                <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">Cantidad</th>
                <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 bg-blue-50 whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              
              <!-- INGRESOS -->
              <tr class="bg-emerald-100">
                <td class="py-3 pl-6 pr-3 text-sm font-bold uppercase text-emerald-900">INGRESOS</td>
                <td class="px-3 py-3"></td>
                <td class="px-3 py-3 bg-emerald-100"></td>
              </tr>

              <tr v-for="(income, idx) in ingresos" :key="'income-' + idx" class="hover:bg-gray-50">
                <td class="py-3 pl-8 pr-3 text-sm text-gray-700">{{ income.name }}</td>
                <td class="px-3 py-3 text-right text-sm text-emerald-700">{{ income.count }}</td>
                <td class="px-3 py-3 text-right text-sm text-emerald-700 font-medium bg-blue-50">
                  {{ fmt(income.total) }}
                </td>
              </tr>

              <tr class="bg-emerald-50 font-semibold">
                <td class="py-3 pl-6 pr-3 text-sm">TOTAL INGRESOS</td>
                <td class="px-3 py-3 text-right text-sm">{{ totalIngresos.count }}</td>
                <td class="px-3 py-3 text-right text-sm text-emerald-700 font-bold bg-emerald-100">
                  {{ fmt(totalIngresos.total) }}
                </td>
              </tr>

              <!-- Espacio -->
              <tr class="h-2"></tr>

              <!-- GASTOS OPERATIVOS -->
              <tr class="bg-rose-100">
                <td class="py-3 pl-6 pr-3 text-sm font-bold uppercase text-rose-900">GASTOS OPERATIVOS</td>
                <td class="px-3 py-3"></td>
                <td class="px-3 py-3 bg-rose-100"></td>
              </tr>

              <tr v-for="(gasto, idx) in gastosOperativos" :key="'gasto-' + idx" class="hover:bg-gray-50">
                <td class="py-3 pl-8 pr-3 text-sm text-gray-700">{{ gasto.name }}</td>
                <td class="px-3 py-3 text-right text-sm text-rose-700">{{ gasto.count }}</td>
                <td class="px-3 py-3 text-right text-sm text-rose-700 font-medium bg-blue-50">
                  {{ fmt(gasto.total) }}
                </td>
              </tr>

              <tr class="bg-rose-50 font-semibold">
                <td class="py-3 pl-6 pr-3 text-sm">TOTAL GASTOS OPERATIVOS</td>
                <td class="px-3 py-3 text-right text-sm">{{ totalGastosOperativos.count }}</td>
                <td class="px-3 py-3 text-right text-sm text-rose-700 font-bold bg-rose-100">
                  {{ fmt(totalGastosOperativos.total) }}
                </td>
              </tr>

              <!-- Espacio -->
              <tr class="h-2"></tr>

              <!-- COSTOS DIRECTOS -->
              <tr class="bg-orange-100">
                <td class="py-3 pl-6 pr-3 text-sm font-bold uppercase text-orange-900">COSTOS DIRECTOS</td>
                <td class="px-3 py-3"></td>
                <td class="px-3 py-3 bg-orange-100"></td>
              </tr>

              <tr v-for="(costo, idx) in costosDirectos" :key="'costo-' + idx" class="hover:bg-gray-50">
                <td class="py-3 pl-8 pr-3 text-sm text-gray-700">{{ costo.name }}</td>
                <td class="px-3 py-3 text-right text-sm text-orange-700">{{ costo.count }}</td>
                <td class="px-3 py-3 text-right text-sm text-orange-700 font-medium bg-blue-50">
                  {{ fmt(costo.total) }}
                </td>
              </tr>

              <tr class="bg-orange-50 font-semibold">
                <td class="py-3 pl-6 pr-3 text-sm">TOTAL COSTOS DIRECTOS</td>
                <td class="px-3 py-3 text-right text-sm">{{ totalCostosDirectos.count }}</td>
                <td class="px-3 py-3 text-right text-sm text-orange-700 font-bold bg-orange-100">
                  {{ fmt(totalCostosDirectos.total) }}
                </td>
              </tr>

              <!-- Espacio -->
              <tr class="h-2"></tr>

              <!-- MARGEN BRUTO -->
              <tr v-if="totalCostosDirectos.total > 0" class="bg-blue-100 font-bold">
                <td class="py-3 pl-6 pr-3 text-sm">MARGEN BRUTO</td>
                <td class="px-3 py-3"></td>
                <td class="px-3 py-3 text-right text-sm text-blue-700 font-bold bg-blue-100">
                  {{ fmt(margenBruto) }}
                </td>
              </tr>

              <!-- UTILIDAD OPERATIVA -->
              <tr class="bg-indigo-100 font-bold text-lg">
                <td class="py-3 pl-6 pr-3 text-sm">UTILIDAD OPERATIVA</td>
                <td class="px-3 py-3"></td>
                <td class="px-3 py-3 text-right text-sm text-indigo-700 font-bold bg-indigo-100">
                  {{ fmt(utilidadOperativa) }}
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <!-- Resumen al pie -->
        <div class="bg-gray-50 border-t border-gray-300 px-6 py-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p class="text-xs font-semibold text-gray-600 uppercase">Total Ingresos</p>
              <p class="text-lg font-bold text-emerald-600 mt-1">{{ fmt(totalIngresos.total) }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-600 uppercase">Total Gastos</p>
              <p class="text-lg font-bold text-red-600 mt-1">{{ fmt(totalGastosOperativos.total + totalCostosDirectos.total) }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-600 uppercase">Margen Bruto %</p>
              <p :class="['text-lg font-bold mt-1', margenBruto >= 55 ? 'text-emerald-600' : 'text-red-600']">
                {{ margenBrutoPercent.toFixed(1) }}%
              </p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-600 uppercase">Utilidad Neta</p>
              <p :class="['text-lg font-bold mt-1', utilidadOperativa >= 0 ? 'text-blue-600' : 'text-red-600']">
                {{ fmt(utilidadOperativa) }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const API = 'http://localhost:4000/api'

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const fromMonth = ref(1)
const toMonth = ref(12)

const periods = ref([])
const transactions = ref([])
const loading = ref(false)

const availableYears = computed(() => {
  const years = []
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i)
  }
  return years
})

onMounted(async () => {
  await loadPeriods()
  await loadData()
})

// Validar que fromMonth no sea mayor que toMonth
watch([fromMonth, toMonth], ([from, to]) => {
  if (from > to) {
    toMonth.value = from
  }
})

async function loadPeriods() {
  try {
    const response = await fetch(`${API}/periods`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      const data = await response.json()
      periods.value = data.data || []
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

async function loadData() {
  loading.value = true
  try {
    // Obtener todos los períodos del año seleccionado en el rango
    const periodsInRange = periods.value.filter(p => 
      p.year === selectedYear.value && 
      p.month >= fromMonth.value && 
      p.month <= toMonth.value
    )

    if (periodsInRange.length === 0) {
      transactions.value = []
      loading.value = false
      return
    }

    // Cargar transacciones de cada período
    const allTransactions = []
    for (const period of periodsInRange) {
      try {
        const response = await fetch(`${API}/transactions?periodId=${period._id}`, {
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        })
        if (response.ok) {
          const data = await response.json()
          allTransactions.push(...(data.data || []))
        }
      } catch (error) {
        console.error('Error loading period:', error)
      }
    }
    transactions.value = allTransactions
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

// Agrupar transacciones por cuenta y tipo
const ingresos = computed(() => {
  const map = {}
  transactions.value
    .filter(t => t.type === 'ingreso')
    .forEach(t => {
      if (!map[t.accountCode]) {
        map[t.accountCode] = { name: t.accountCode, total: 0, count: 0 }
      }
      map[t.accountCode].total += t.monto
      map[t.accountCode].count += 1
    })
  return Object.values(map)
})

const gastosOperativos = computed(() => {
  const map = {}
  transactions.value
    .filter(t => t.type === 'egreso')
    .forEach(t => {
      const key = t.accountCode || 'Otros'
      if (!map[key]) {
        map[key] = { name: key, total: 0, count: 0 }
      }
      map[key].total += t.monto
      map[key].count += 1
    })
  return Object.values(map)
})

const costosDirectos = computed(() => []) // Vacío por ahora

const totalIngresos = computed(() => ({
  total: ingresos.value.reduce((sum, i) => sum + i.total, 0),
  count: ingresos.value.reduce((sum, i) => sum + i.count, 0)
}))

const totalGastosOperativos = computed(() => ({
  total: gastosOperativos.value.reduce((sum, g) => sum + g.total, 0),
  count: gastosOperativos.value.reduce((sum, g) => sum + g.count, 0)
}))

const totalCostosDirectos = computed(() => ({
  total: costosDirectos.value.reduce((sum, c) => sum + c.total, 0),
  count: costosDirectos.value.reduce((sum, c) => sum + c.count, 0)
}))

const margenBruto = computed(() => totalIngresos.value.total - totalCostosDirectos.value.total)

const utilidadOperativa = computed(() => margenBruto.value - totalGastosOperativos.value.total)

const margenBrutoPercent = computed(() => {
  if (totalIngresos.value.total === 0) return 0
  return (margenBruto.value / totalIngresos.value.total) * 100
})

const fmt = (val) => new Intl.NumberFormat('es-HN', {
  style: 'currency',
  currency: 'HNL',
  minimumFractionDigits: 2
}).format(val || 0)

function monthName(month) {
  const months = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return months[month] || month
}

async function exportToExcel() {
  if (transactions.value.length === 0) return

  try {
    const data = [
      ['ESTADO DE RESULTADOS'],
      [],
      ['Concepto', 'Cantidad', 'Total'],
      
      // Ingresos
      ['INGRESOS'],
      ...ingresos.value.map(i => [i.name, i.count, i.total]),
      ['TOTAL INGRESOS', totalIngresos.value.count, totalIngresos.value.total],
      [],

      // Gastos
      ['GASTOS OPERATIVOS'],
      ...gastosOperativos.value.map(g => [g.name, g.count, g.total]),
      ['TOTAL GASTOS', totalGastosOperativos.value.count, totalGastosOperativos.value.total],
      [],

      // Utilidad
      ['UTILIDAD OPERATIVA', '', utilidadOperativa.value]
    ]

    // Exportar usando CSV (sin librerías)
    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `EERR_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  } catch (error) {
    console.error('Error al exportar:', error)
  }
}
</script>

<style scoped>
table {
  table-layout: auto;
}
</style>