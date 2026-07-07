<template>
  <div class="dashboard-page">
    <main class="dashboard-container">
      <PageHeader title="Panel principal" :subtitle="headerSubtitle" />

      <section v-if="loading" class="message-card">
        Cargando resumen...
      </section>

      <section v-else-if="error" class="message-card error">
        {{ error }}
      </section>

      <template v-else>
        <section class="kpi-row">
          <BaseStatCard
            label="Utilidad neta"
            :value="fmt(summary.utilidadNeta)"
            :sub="periodoActualLabel"
            :tone="summary.utilidadNeta >= 0 ? 'income' : 'expense'"
            :delta="deltaUtilidad"
          />
          <BaseStatCard
            label="Total ingresos"
            :value="fmt(summary.totalIngresos)"
            :sub="`${summary.cantidadIngresos || 0} registros`"
            tone="income"
            :delta="deltaIngresos"
          />
          <BaseStatCard
            label="Total egresos"
            :value="fmt(summary.totalEgresos)"
            :sub="`${summary.cantidadEgresos || 0} registros`"
            tone="expense"
            :delta="deltaEgresos"
          />
          <BaseStatCard
            label="Total compras"
            :value="fmt(summary.totalCompras)"
            :sub="`${summary.cantidadCompras || 0} registros`"
            tone="warning"
            :delta="deltaCompras"
          />
        </section>

        <section v-if="summary.utilidadNeta < 0" class="warning-card">
          <ExclamationTriangleIcon class="warning-icon" />
          <p>La utilidad neta es negativa. Revisa los egresos y compras registradas.</p>
        </section>

        <section class="content-grid">
          <div class="list-card">
            <div class="list-header">
              <h2>Indicadores de rendimiento</h2>
              <span class="header-note">{{ periodoActualLabel }}</span>
            </div>

            <div v-if="summary.totalIngresos === 0" class="list-empty">
              Aún no hay ingresos suficientes para calcular indicadores.
            </div>

            <div v-else class="indicator-list">
              <BaseKpiBar
                label="Margen operativo"
                :value="margenOperativo"
                :threshold="10"
                good-when="gte"
              />
              <BaseKpiBar
                label="Margen bruto"
                :value="margenBruto"
                :threshold="30"
                good-when="gte"
              />
              <BaseKpiBar
                label="Gasto / ingreso"
                :value="gastoSobreIngreso"
                :threshold="100"
                good-when="lte"
              />
            </div>
          </div>

          <div class="list-card">
            <div class="list-header">
              <h2>Resumen de gastos</h2>
              <span class="header-note">{{ periodoActualLabel }}</span>
            </div>

            <div v-if="summary.totalEgresos === 0 && summary.totalCompras === 0" class="list-empty">
              Aún no hay gastos registrados.
            </div>

            <ul v-else class="list-items">
              <li class="list-item">
                <div class="list-item-main">
                  <span class="list-item-title">Egresos</span>
                  <span class="list-item-sub">{{ summary.cantidadEgresos || 0 }} registros</span>
                </div>
                <span class="list-item-amount amount-expense">{{ fmt(summary.totalEgresos) }}</span>
              </li>
              <li class="list-item">
                <div class="list-item-main">
                  <span class="list-item-title">Compras</span>
                  <span class="list-item-sub">{{ summary.cantidadCompras || 0 }} registros</span>
                </div>
                <span class="list-item-amount amount-purchase">{{ fmt(summary.totalCompras) }}</span>
              </li>
              <li class="list-item">
                <div class="list-item-main">
                  <span class="list-item-title">Total gastos</span>
                  <span class="list-item-sub">Egresos + compras</span>
                </div>
                <span class="list-item-amount amount-expense">{{ fmt(totalGastos) }}</span>
              </li>
            </ul>
          </div>

          <div class="list-card content-grid-wide">
            <div class="list-header">
              <h2>Últimas compras</h2>
              <router-link to="/transactions" class="list-link">Ver todas</router-link>
            </div>

            <div v-if="!summary.ultimasCompras?.length" class="list-empty">
              Aún no hay compras registradas.
            </div>

            <ul v-else class="purchase-grid">
              <li v-for="compra in summary.ultimasCompras" :key="compra._id" class="purchase-item">
                <div class="list-item-main">
                  <span class="list-item-title">{{ compra.proveedor || 'Sin proveedor' }}</span>
                  <span class="list-item-sub">Factura {{ compra.numeroFactura || '-' }} - {{ formatDate(compra.fechaDocumento) }}</span>
                </div>
                <span class="list-item-amount amount-purchase">{{ fmt(compra.totalBruto) }}</span>
              </li>
            </ul>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseStatCard from '@/components/common/BaseStatCard.vue'
import BaseKpiBar from '@/components/common/BaseKpiBar.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import dashboardApi from '@/api/dashboard'

const currentYear = new Date().getFullYear()
const loading = ref(false)
const error = ref('')

const summary = ref({
  totalIngresos: 0,
  totalEgresos: 0,
  totalCompras: 0,
  utilidadNeta: 0,
  cantidadIngresos: 0,
  cantidadEgresos: 0,
  cantidadCompras: 0,
  periodoActualNombre: null,
  summaryAnterior: null,
  ultimasTransacciones: [],
  ultimasCompras: []
})

const headerSubtitle = computed(() => `Resumen del ejercicio ${currentYear}`)
const periodoActualLabel = computed(() => summary.value.periodoActualNombre || 'Período actual')
const totalGastos = computed(() => (summary.value.totalEgresos || 0) + (summary.value.totalCompras || 0))

const deltaIngresos = computed(() => calcDelta(summary.value.totalIngresos, summary.value.summaryAnterior?.totalIngresos))
const deltaEgresos = computed(() => calcDelta(summary.value.totalEgresos, summary.value.summaryAnterior?.totalEgresos))
const deltaCompras = computed(() => calcDelta(summary.value.totalCompras, summary.value.summaryAnterior?.totalCompras))
const deltaUtilidad = computed(() => calcDelta(summary.value.utilidadNeta, summary.value.summaryAnterior?.utilidadNeta))

const margenOperativo = computed(() => {
  if (!summary.value.totalIngresos) return 0
  return (summary.value.utilidadNeta / summary.value.totalIngresos) * 100
})

const margenBruto = computed(() => {
  if (!summary.value.totalIngresos) return 0
  return ((summary.value.totalIngresos - summary.value.totalCompras) / summary.value.totalIngresos) * 100
})

const gastoSobreIngreso = computed(() => {
  if (!summary.value.totalIngresos) return 0
  return (summary.value.totalEgresos / summary.value.totalIngresos) * 100
})

onMounted(loadSummary)

async function loadSummary() {
  loading.value = true
  error.value = ''

  try {
    const response = await dashboardApi.getSummary(currentYear)
    summary.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'No se pudo cargar el resumen'
  } finally {
    loading.value = false
  }
}

function calcDelta(actual, anterior) {
  if (anterior === null || anterior === undefined || anterior === 0) return null
  return ((actual - anterior) / Math.abs(anterior)) * 100
}

function fmt(value) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2
  }).format(value || 0)
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-HN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100%;
  background: var(--color-bg-app);
}

.dashboard-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.message-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  color: #6b7280;
  padding: 36px;
  text-align: center;
}

.message-card.error {
  color: #dc2626;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.warning-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 16px;
  padding: 14px 16px;
  border: 1px solid #fde68a;
  border-radius: 10px;
  background: #fffbeb;
  color: #92400e;
  font-size: 14px;
}

.warning-card p {
  margin: 0;
}

.warning-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #d97706;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.content-grid-wide {
  grid-column: 1 / -1;
}

.list-card {
  min-width: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.list-header h2 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
}

.header-note {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.list-link {
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

.list-link:hover {
  text-decoration: underline;
}

.list-empty {
  color: #6b7280;
  font-size: 13px;
  padding: 18px 0;
  text-align: center;
}

.indicator-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-items,
.purchase-grid {
  list-style: none;
  padding: 0;
  margin: 0;
}

.purchase-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.list-item,
.purchase-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.list-item {
  padding: 10px 0;
  border-top: 1px solid #f1f5f9;
}

.list-item:first-child {
  border-top: 0;
}

.purchase-item {
  padding: 12px;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  background: #f9fafb;
}

.list-item-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.list-item-title {
  color: #111827;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-sub {
  color: #9ca3af;
  font-size: 11.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-amount {
  flex-shrink: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.amount-income {
  color: #047857;
}

.amount-expense {
  color: #b91c1c;
}

.amount-purchase {
  color: #92400e;
}

@media (max-width: 1100px) {
  .kpi-row,
  .content-grid,
  .purchase-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid-wide {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .dashboard-container {
    padding: 20px 14px 36px;
  }

  .kpi-row,
  .content-grid,
  .purchase-grid {
    grid-template-columns: 1fr;
  }
}
</style>
