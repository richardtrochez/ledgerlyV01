<template>
  <div class="dashboard-page">
    <main class="dashboard-container">
      <section class="ledgerly-soft-panel hero">
        <div>
          <p class="eyebrow">Panel financiero</p>
          <h1>Dashboard</h1>
          <p class="subtitle">Resumen del ejercicio {{ currentYear }}</p>
        </div>

        <button class="refresh-button" :disabled="loading" @click="loadSummary">
          Actualizar
        </button>
      </section>

      <section v-if="loading" class="message-card">
        Cargando resumen...
      </section>

      <section v-else-if="error" class="message-card error">
        {{ error }}
      </section>

      <template v-else>
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
          <BaseStatCard
            label="Periodos"
            :value="String(summary.periodosRegistrados)"
            sub="Registrados en el ejercicio"
            tone="default"
          />
        </section>

        <BaseAlert v-if="summary.utilidadNeta < 0" tone="danger" class="alert-box">
          La utilidad neta es negativa. Revisa los egresos y compras registradas.
        </BaseAlert>

        <section class="actions-section">
          <div class="section-header">
            <p class="eyebrow">Herramientas</p>
            <h2>Acciones rapidas</h2>
          </div>

          <div class="actions-grid">
            <router-link
              v-for="action in actions"
              :key="action.to"
              :to="action.to"
              class="action-link"
            >
              <BaseCard hoverable shadow="sm" class="action-card">
                <p class="action-title">{{ action.title }}</p>
                <p class="action-subtitle">{{ action.subtitle }}</p>
              </BaseCard>
            </router-link>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseStatCard from '@/components/common/BaseStatCard.vue'
import dashboardApi from '@/api/dashboard'

const currentYear = new Date().getFullYear()
const loading = ref(false)
const error = ref('')

const summary = ref({
  totalIngresos: 0,
  totalEgresos: 0,
  totalCompras: 0,
  utilidadNeta: 0,
  periodosRegistrados: 0,
  cantidadIngresos: 0,
  cantidadEgresos: 0,
  cantidadCompras: 0
})

const actions = [
  {
    to: '/sales-expenses',
    title: 'Ingresos y gastos',
    subtitle: 'Registrar movimientos'
  },
  {
    to: '/transactions',
    title: 'Compras',
    subtitle: 'Registrar facturas'
  },
  {
    to: '/income-statement',
    title: 'Estado de resultados',
    subtitle: 'Ver reporte financiero'
  },
  {
    to: '/importar',
    title: 'Importar Excel',
    subtitle: 'Cargar movimientos'
  }
]

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
</script>

<style scoped>
.dashboard-page {
  min-height: 100%;
  background: var(--color-bg-app);
}

.dashboard-container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 28px;
  border-radius: 14px;
}

.eyebrow {
  margin: 0;
  color: var(--color-primary-deep);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 6px 0 0;
  color: var(--color-text-main);
}

h1 {
  font-size: 30px;
  font-weight: 800;
}

h2 {
  font-size: 18px;
  font-weight: 700;
}

.subtitle {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.refresh-button {
  border: 0;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  padding: 10px 16px;
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: .6;
}

.message-card {
  margin-top: 20px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: #fff;
  color: var(--color-text-muted);
  padding: 36px;
  text-align: center;
}

.message-card.error {
  color: var(--color-danger, #dc2626);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.alert-box {
  margin-top: 18px;
}

.actions-section {
  margin-top: 30px;
}

.section-header {
  margin-bottom: 14px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.action-link {
  color: inherit;
  text-decoration: none;
}

.action-card {
  height: 100%;
}

.action-title {
  margin: 0;
  color: var(--color-text-main);
  font-weight: 700;
}

.action-subtitle {
  margin: 6px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

@media (max-width: 960px) {
  .stats-grid,
  .actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 20px 14px 36px;
  }

  .hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .refresh-button {
    width: 100%;
  }

  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
