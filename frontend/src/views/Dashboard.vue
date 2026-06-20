<template>
  <div class="min-h-full bg-[var(--color-bg-app)]">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section class="ledgerly-soft-panel mb-8 overflow-hidden rounded-xl px-6 py-7 text-[var(--color-text-main)]">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-wide text-[var(--color-primary-deep)]">Panel financiero</p>
            <h2 class="mt-2 text-3xl font-bold">Dashboard ejecutivo</h2>
            <p class="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
              Resumen de ingresos, egresos, utilidad y margenes del periodo seleccionado.
            </p>
          </div>

          <div class="w-full max-w-xs">
            <label class="block text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">Periodo</label>
            <PeriodSelect
              v-model="selectedPeriodId"
              @change="loadData"
              :options="periodOptions"
            />
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <BaseStatCard
          label="Total ingresos"
          :value="fmt(summary.totalIngresos)"
          :sub="`${summary.cantidadIngresos} registros`"
          tone="income"
        />
        <BaseStatCard
          label="Total egresos"
          :value="fmt(summary.totalEgresos)"
          :sub="`${summary.cantidadEgresos} registros`"
          tone="expense"
        />
        <BaseStatCard
          label="Utilidad neta"
          :value="fmt(utilidadOperativa)"
          :sub="utilidadOperativa >= 0 ? 'Resultado positivo' : 'Resultado negativo'"
          :tone="utilidadOperativa >= 0 ? 'profit' : 'expense'"
        />
        <BaseStatCard
          label="Margen operativo"
          :value="`${margenOperativo.toFixed(1)}%`"
          :sub="margenOperativo >= 10 ? 'Sobre umbral de control' : 'Requiere atencion'"
          :tone="margenOperativo >= 10 ? 'income' : 'warning'"
        />
        <BaseStatCard
          label="Margen bruto"
          :value="`${margenBruto.toFixed(1)}%`"
          :sub="margenBruto >= 55 ? 'Sobre umbral de control' : 'Requiere atencion'"
          :tone="margenBruto >= 55 ? 'profit' : 'warning'"
        />
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <BaseKpiBar label="Margen bruto" :value="margenBruto" :threshold="55" goodWhen="gte" />
        <BaseKpiBar label="Gasto sobre ventas" :value="gastoSobreVentas" :threshold="45" goodWhen="lte" />
      </section>

      <section v-if="alertas.length > 0" class="mb-8 space-y-2">
        <BaseAlert
          v-for="(alerta, i) in alertas"
          :key="i"
          :tone="alerta.tipo"
        >
          {{ alerta.mensaje }}
        </BaseAlert>
      </section>

      <section>
        <div class="mb-4">
          <p class="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Herramientas</p>
          <h3 class="mt-1 text-lg font-semibold text-[var(--color-text-main)]">Acciones rapidas</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link
            v-for="action in actions"
            :key="action.to"
            :to="action.to"
            class="block"
          >
            <BaseCard hoverable shadow="sm" class="h-full">
              <div class="flex items-center justify-between mb-3">
                <div :class="['p-3 rounded-lg ring-1 ring-inset ring-[var(--color-border-soft)]', action.bg]">
                  <svg class="w-5 h-5" :class="action.icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.path" />
                  </svg>
                </div>
              </div>
              <p class="font-semibold text-[var(--color-text-main)]">{{ action.title }}</p>
              <p class="text-xs text-[var(--color-text-muted)] mt-1">{{ action.subtitle }}</p>
            </BaseCard>
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseKpiBar from '@/components/common/BaseKpiBar.vue'
import BaseStatCard from '@/components/common/BaseStatCard.vue'
import PeriodSelect from '@/components/common/PeriodSelect.vue'

const authStore = useAuthStore()
const API = 'http://localhost:4000/api'

const selectedPeriodId = ref('')
const periods = ref([])
const summary = ref({
  totalIngresos: 0,
  totalEgresos: 0,
  cantidadIngresos: 0,
  cantidadEgresos: 0
})

const actions = [
  {
    to: '/sales-expenses',
    title: 'Ingresos y gastos',
    subtitle: 'Registrar movimientos',
    bg: 'bg-blue-50',
    icon: 'text-[var(--color-primary-deep)]',
    path: 'M12 4v16m8-8H4'
  },
  {
    to: '/transactions',
    title: 'Compras',
    subtitle: 'Registrar facturas',
    bg: 'bg-blue-50',
    icon: 'text-[var(--color-primary)]',
    path: 'M9 12h6m-6 4h6M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z'
  },
  {
    to: '/income-statement',
    title: 'Estado de resultados',
    subtitle: 'Analizar utilidad',
    bg: 'bg-blue-50',
    icon: 'text-[var(--color-primary-deep)]',
    path: 'M4 19V5m0 14h16M8 16V9m4 7V7m4 9v-5'
  },
  {
    to: '/importar',
    title: 'Importar Excel',
    subtitle: 'Cargar archivos',
    bg: 'bg-[var(--color-bg-surface-soft)]',
    icon: 'text-[var(--color-text-muted)]',
    path: 'M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'
  }
]

const utilidadOperativa = computed(() => summary.value.totalIngresos - summary.value.totalEgresos)

const periodOptions = computed(() => periods.value.map(period => ({
  value: period._id,
  label: `${monthName(period.month)} ${period.year}`
})))

const margenOperativo = computed(() => {
  if (!summary.value.totalIngresos) return 0
  return (utilidadOperativa.value / summary.value.totalIngresos) * 100
})

const margenBruto = computed(() => {
  if (!summary.value.totalIngresos) return 0
  return ((summary.value.totalIngresos - summary.value.totalEgresos) / summary.value.totalIngresos) * 100
})

const gastoSobreVentas = computed(() => {
  if (!summary.value.totalIngresos) return 0
  return (summary.value.totalEgresos / summary.value.totalIngresos) * 100
})

const alertas = computed(() => {
  const lista = []
  if (utilidadOperativa.value < 0) lista.push({ tipo: 'danger', mensaje: 'Utilidad operativa negativa en este periodo' })
  if (margenOperativo.value < 10 && summary.value.totalIngresos > 0) lista.push({ tipo: 'warning', mensaje: `Margen operativo bajo (${margenOperativo.value.toFixed(1)}%)` })
  if (gastoSobreVentas.value > 45 && summary.value.totalIngresos > 0) lista.push({ tipo: 'warning', mensaje: `Gastos superan el 45% de las ventas (${gastoSobreVentas.value.toFixed(1)}%)` })
  return lista
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

onMounted(async () => {
  await loadPeriods()
})

async function loadPeriods() {
  try {
    const response = await fetch(`${API}/periods`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      const data = await response.json()
      periods.value = data.data || []
      const june2026 = periods.value.find(period => period.month === 6 && period.year === 2026)
      if (june2026) {
        selectedPeriodId.value = june2026._id
        await loadData()
      }
    }
  } catch (error) {
    console.error('Error cargando periodos:', error)
  }
}

async function loadData() {
  if (!selectedPeriodId.value) {
    summary.value = { totalIngresos: 0, totalEgresos: 0, cantidadIngresos: 0, cantidadEgresos: 0 }
    return
  }

  try {
    const response = await fetch(`${API}/transactions?periodId=${selectedPeriodId.value}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      const data = await response.json()
      const transactions = data.data || []

      const ingresos = transactions.filter(t => t.type === 'ingreso')
      const egresos = transactions.filter(t => t.type === 'egreso')

      summary.value = {
        totalIngresos: ingresos.reduce((sum, t) => sum + t.monto, 0),
        totalEgresos: egresos.reduce((sum, t) => sum + t.monto, 0),
        cantidadIngresos: ingresos.length,
        cantidadEgresos: egresos.length
      }
    }
  } catch (error) {
    console.error('Error cargando transacciones:', error)
  }
}
</script>
