<template>
  <div class="dashboard-page">
    <main class="dashboard-container">
      <!-- Encabezado simple -->
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p class="subtitle">Resumen del ejercicio {{ currentYear }}</p>
        </div>
        <button class="refresh-button" :disabled="loading" @click="loadSummary">
          {{ loading ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>

      <section v-if="loading" class="message-card">
        Cargando resumen...
      </section>

      <section v-else-if="error" class="message-card error">
        {{ error }}
      </section>

      <template v-else>
        <!-- Cards de KPIs principales -->
        <section class="stats-grid">
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
            label="Total compras"
            :value="fmt(summary.totalCompras)"
            :sub="`${summary.cantidadCompras} registros`"
            tone="warning"
          />
          <BaseStatCard
            label="Utilidad neta"
            :value="fmt(summary.utilidadNeta)"
            :sub="summary.utilidadNeta >= 0 ? 'Resultado positivo' : 'Resultado negativo'"
            :tone="summary.utilidadNeta >= 0 ? 'profit' : 'expense'"
          />
        </section>

        <!-- Cards secundarias: contexto de periodos -->
        <section class="stats-grid-secondary">
          <BaseStatCard
            label="Periodo actual"
            :value="periodoActualNombre"
            :sub="periodoActualSub"
            tone="default"
          />
          <BaseStatCard
            label="Periodos abiertos"
            :value="String(summary.periodosAbiertos || 0)"
            :sub="periodosAbiertosSub"
            :tone="(summary.periodosAbiertos || 0) > 3 ? 'expense' : 'default'"
          />
          <BaseStatCard
            label="Periodos registrados"
            :value="String(summary.periodosRegistrados || 0)"
            sub="En el ejercicio"
            tone="default"
          />
        </section>

        <BaseAlert v-if="summary.utilidadNeta < 0" tone="danger" class="alert-box">
          La utilidad neta es negativa. Revisa los egresos y compras registradas.
        </BaseAlert>

        <!-- Listas cortas: últimas transacciones y compras -->
        <section class="lists-grid">
          <!-- Últimas transacciones -->
          <div class="list-card">
            <div class="list-header">
              <h2>Últimas transacciones</h2>
              <router-link to="/sales-expenses" class="list-link">Ver todas</router-link>
            </div>
            <div v-if="!summary.ultimasTransacciones || summary.ultimasTransacciones.length === 0" class="list-empty">
              Aún no hay transacciones registradas.
            </div>
            <ul v-else class="list-items">
              <li v-for="tx in summary.ultimasTransacciones" :key="tx._id" class="list-item">
                <div class="list-item-main">
                  <span class="list-item-title">{{ tx.descripcion || 'Sin descripción' }}</span>
                  <span class="list-item-sub">{{ formatDate(tx.fecha) }}</span>
                </div>
                <span
                  class="list-item-amount"
                  :class="tx.type === 'ingreso' ? 'amount-income' : 'amount-expense'"
                >
                  {{ tx.type === 'ingreso' ? '+' : '-' }}{{ fmt(tx.monto) }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Últimas compras -->
          <div class="list-card">
            <div class="list-header">
              <h2>Últimas compras</h2>
              <router-link to="/transactions" class="list-link">Ver todas</router-link>
            </div>
            <div v-if="!summary.ultimasCompras || summary.ultimasCompras.length === 0" class="list-empty">
              Aún no hay compras registradas.
            </div>
            <ul v-else class="list-items">
              <li v-for="c in summary.ultimasCompras" :key="c._id" class="list-item">
                <div class="list-item-main">
                  <span class="list-item-title">{{ c.proveedor }}</span>
                  <span class="list-item-sub">Factura {{ c.numeroFactura }} · {{ formatDate(c.fechaDocumento) }}</span>
                </div>
                <span class="list-item-amount amount-purchase">{{ fmt(c.totalBruto) }}</span>
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
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseStatCard from '@/components/common/BaseStatCard.vue'
import dashboardApi from '@/api/dashboard'

const currentYear = new Date().getFullYear()
const loading = ref(false)
const error = ref('')

const meses = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const summary = ref({
  totalIngresos: 0,
  totalEgresos: 0,
  totalCompras: 0,
  utilidadNeta: 0,
  periodosRegistrados: 0,
  periodosAbiertos: 0,
  cantidadIngresos: 0,
  cantidadEgresos: 0,
  cantidadCompras: 0,
  periodoActual: null,
  ultimasTransacciones: [],
  ultimasCompras: []
})

const periodoActualNombre = computed(() => {
  if (!summary.value.periodoActual) return 'Sin registrar'
  const { month, year } = summary.value.periodoActual
  return `${meses[month]} ${year}`
})

const periodoActualSub = computed(() => {
  if (!summary.value.periodoActual) return 'Crea el periodo del mes en curso'
  return summary.value.periodoActual.status === 'abierto' ? 'Abierto para registro' : 'Cerrado'
})

const periodosAbiertosSub = computed(() => {
  const n = summary.value.periodosAbiertos || 0
  if (n === 0) return 'Ninguno abierto'
  if (n === 1) return 'Aceptando registros'
  if (n > 3) return 'Considera cerrar los antiguos'
  return 'Aceptando registros'
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

function fmt(value) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2
  }).format(value || 0)
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100%;
  background: var(--color-bg-app);
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

/* Encabezado simple (sin banner) */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

h1 {
  margin: 0;
  color: var(--color-text-main);
  font-size: 26px;
  font-weight: 800;
}

h2 {
  margin: 0;
  color: var(--color-text-main);
  font-size: 16px;
  font-weight: 700;
}

.subtitle {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.refresh-button {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
  color: var(--color-text-main);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  padding: 9px 16px;
  transition: background .15s;
}
.refresh-button:hover:not(:disabled) { background: #f8fafc; }
.refresh-button:disabled { cursor: not-allowed; opacity: .6; }

.message-card {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: #fff;
  color: var(--color-text-muted);
  padding: 36px;
  text-align: center;
}
.message-card.error { color: var(--color-danger, #dc2626); }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.stats-grid-secondary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.alert-box { margin-top: 18px; }

/* Listas de últimas transacciones y compras */
.lists-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}
.list-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 18px 20px;
}
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.list-link {
  color: var(--color-primary-deep, #1d4ed8);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}
.list-link:hover { text-decoration: underline; }
.list-empty {
  color: var(--color-text-muted);
  font-size: 13px;
  padding: 16px 0;
  text-align: center;
}
.list-items { list-style: none; padding: 0; margin: 0; }
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid #f1f5f9;
}
.list-item:first-child { border-top: 0; }
.list-item-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.list-item-title { font-size: 13px; font-weight: 600; color: var(--color-text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.list-item-sub { font-size: 12px; color: var(--color-text-muted); }
.list-item-amount { font-size: 13px; font-weight: 700; white-space: nowrap; }
.amount-income { color: #15803d; }
.amount-expense { color: #b91c1c; }
.amount-purchase { color: #b45309; }

@media (max-width: 960px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stats-grid-secondary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lists-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .dashboard-container { padding: 20px 14px 36px; }
  .dashboard-header { flex-direction: column; align-items: flex-start; }
  .refresh-button { width: 100%; }
  .stats-grid, .stats-grid-secondary { grid-template-columns: 1fr; }
}
</style>
