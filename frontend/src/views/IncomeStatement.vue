<template>
  <div class="page">
    <section class="ledgerly-soft-panel hero">
      <div>
        <p class="hero-eyebrow">Reportes financieros</p>
        <h1 class="hero-title">Estado de Resultados</h1>
        <p class="hero-sub">{{ displayRange }}</p>
      </div>

      <div class="hero-kpis">
        <div class="kpi">
          <p class="kpi-label">Ingresos</p>
          <p class="kpi-val">{{ fmt(totalIngresos) }}</p>
        </div>
        <div class="kpi">
          <p class="kpi-label">Gastos totales</p>
          <p class="kpi-val">{{ fmt(totalGastos) }}</p>
        </div>
        <div class="kpi">
          <p class="kpi-label">Utilidad operativa</p>
          <p class="kpi-val" :class="{ negative: utilidadOperativa < 0 }">
            {{ fmt(utilidadOperativa) }}
          </p>
        </div>
      </div>
    </section>

    <section class="filter-bar ledgerly-surface">
      <div class="filter-group">
        <label>Ejercicio</label>
        <PeriodSelect v-model="year" :options="yearOptions" />
      </div>
      <div class="filter-group">
        <label>Desde</label>
        <PeriodSelect v-model="fromMonth" :options="monthOptions" />
      </div>
      <div class="filter-group">
        <label>Hasta</label>
        <PeriodSelect v-model="toMonth" :options="monthOptions" />
      </div>
      <button class="btn btn-primary" :disabled="loading || !hasData" @click="exportExcel">
        Exportar Excel
      </button>
    </section>

    <section v-if="error" class="empty-card ledgerly-surface error">
      {{ error }}
    </section>

    <section v-else-if="loading" class="empty-card ledgerly-surface">
      Cargando datos...
    </section>

    <section v-else-if="!hasData" class="empty-card ledgerly-surface">
      <h3>No hay datos para este rango</h3>
      <p>Selecciona un periodo con transacciones o compras registradas.</p>
    </section>

    <section v-else class="statement ledgerly-surface">
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th v-for="month in months" :key="month.periodId" class="right">
              {{ shortMonth(month.name) }}
            </th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="section in sections" :key="section.type">
            <tr class="section-row">
              <td :colspan="months.length + 2">{{ section.name }}</td>
            </tr>
            <tr v-for="item in section.costClasses" :key="section.type + item.name">
              <td>{{ item.name }}</td>
              <td v-for="(amount, index) in item.months" :key="index" class="right">
                {{ fmt(amount) }}
              </td>
              <td class="right strong">{{ fmt(item.total) }}</td>
            </tr>
            <tr class="subtotal">
              <td>Total {{ section.name.toLowerCase() }}</td>
              <td v-for="(amount, index) in section.totals" :key="index" class="right">
                {{ fmt(amount) }}
              </td>
              <td class="right">{{ fmt(section.grandTotal) }}</td>
            </tr>
          </template>

          <tr class="result">
            <td>Margen bruto</td>
            <td v-for="(amount, index) in summary.margenBruto" :key="index" class="right">
              {{ fmt(amount) }}
            </td>
            <td class="right">{{ fmt(totalMargenBruto) }}</td>
          </tr>
          <tr class="result final">
            <td>Utilidad operativa</td>
            <td v-for="(amount, index) in summary.utilidadOperativa" :key="index" class="right">
              {{ fmt(amount) }}
            </td>
            <td class="right">{{ fmt(utilidadOperativa) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import PeriodSelect from '@/components/common/PeriodSelect.vue'
import reportsApi from '@/api/reports'

const currentYear = new Date().getFullYear()
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const yearOptions = [0, 1, 2].map(offset => {
  const value = String(currentYear - offset)
  return { value, label: value }
})
const monthOptions = MONTH_NAMES.map((name, index) => ({
  value: String(index + 1),
  label: `${index + 1} - ${name}`
}))

const year = ref(String(currentYear))
const fromMonth = ref('1')
const toMonth = ref('12')
const loading = ref(false)
const error = ref('')
const report = ref({
  months: [],
  sections: [],
  summary: {
    totalIngresos: [],
    totalCostos: [],
    margenBruto: [],
    totalGastos: [],
    utilidadOperativa: []
  }
})

const months = computed(() => report.value.months || [])
const sections = computed(() => report.value.sections || [])
const summary = computed(() => report.value.summary || {})
const hasData = computed(() => sections.value.length > 0)

const displayRange = computed(() => {
  const from = MONTH_NAMES[Number(fromMonth.value) - 1]
  const to = MONTH_NAMES[Number(toMonth.value) - 1]
  return from === to ? `${from} ${year.value}` : `${from} - ${to} ${year.value}`
})

const sum = values => (values || []).reduce((total, value) => total + Number(value || 0), 0)
const totalIngresos = computed(() => sum(summary.value.totalIngresos))
const totalCostos = computed(() => sum(summary.value.totalCostos))
const totalGastosOperativos = computed(() => sum(summary.value.totalGastos))
const totalGastos = computed(() => totalCostos.value + totalGastosOperativos.value)
const totalMargenBruto = computed(() => sum(summary.value.margenBruto))
const utilidadOperativa = computed(() => sum(summary.value.utilidadOperativa))

onMounted(loadReport)

watch(fromMonth, value => {
  if (Number(value) > Number(toMonth.value)) toMonth.value = value
  loadReport()
})
watch([year, toMonth], loadReport)

async function loadReport() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await reportsApi.getIncomeStatement({
      year: year.value,
      fromMonth: fromMonth.value,
      toMonth: toMonth.value
    })
    report.value = data.data || report.value
  } catch (err) {
    error.value = err.response?.data?.message || 'No se pudo cargar el estado de resultados'
  } finally {
    loading.value = false
  }
}

function shortMonth(name) {
  return String(name || '').slice(0, 3).toUpperCase()
}

function fmt(value) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2
  }).format(value || 0)
}

async function exportExcel() {
  const XLSX = await import('xlsx')
  const rows = []

  sections.value.forEach(section => {
    rows.push({ Concepto: section.name })
    section.costClasses.forEach(item => {
      const row = { Concepto: item.name, Total: item.total }
      months.value.forEach((month, index) => { row[month.name] = item.months[index] || 0 })
      rows.push(row)
    })
    rows.push({ Concepto: `Total ${section.name.toLowerCase()}`, Total: section.grandTotal })
    rows.push({})
  })

  rows.push({ Concepto: 'Margen bruto', Total: totalMargenBruto.value })
  rows.push({ Concepto: 'Utilidad operativa', Total: utilidadOperativa.value })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{ wch: 34 }, ...months.value.map(() => ({ wch: 16 })), { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Estado de Resultados')
  XLSX.writeFile(wb, `Ledgerly_EERR_${year.value}_M${fromMonth.value}-${toMonth.value}.xlsx`)
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 32px 44px;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  border-radius: 16px;
  flex-wrap: wrap;
}

.hero-eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--brand-900);
}

.hero-title {
  margin: 6px 0 4px;
  font-size: 26px;
  font-weight: 800;
}

.hero-sub {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.hero-kpis {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.kpi {
  min-width: 150px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
}

.kpi-label {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--muted);
}

.kpi-val {
  margin: 4px 0 0;
  font-size: 18px;
  font-weight: 800;
}

.negative {
  color: var(--expense);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 22px;
  border-radius: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
}

.btn {
  margin-left: auto;
  border: 0;
  border-radius: 9px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: var(--brand);
  color: #fff;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.empty-card {
  border-radius: 14px;
  padding: 52px;
  text-align: center;
  color: var(--muted);
}

.empty-card h3 {
  margin: 0 0 6px;
  color: var(--ink);
}

.empty-card p {
  margin: 0;
}

.error {
  color: var(--expense);
}

.statement {
  border-radius: 14px;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

th {
  padding: 13px 18px;
  background: #1e40af;
  color: #fff;
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
}

td {
  padding: 10px 18px;
  border-top: 1px solid var(--line);
  color: var(--ink-2);
  font-size: 13px;
}

.right {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.strong {
  font-weight: 700;
  color: var(--ink);
}

.section-row td {
  background: #f8faff;
  color: var(--brand-900);
  font-weight: 800;
  text-transform: uppercase;
}

.subtotal td {
  background: #fafafa;
  font-weight: 800;
  color: var(--ink);
}

.result td {
  background: #eff6ff;
  font-weight: 800;
  color: var(--brand-900);
}

.result.final td {
  background: #1e40af;
  color: #fff;
}

@media (max-width: 768px) {
  .page {
    padding: 16px 14px 32px;
  }

  .hero {
    padding: 22px 20px;
  }

  .btn {
    width: 100%;
    margin-left: 0;
  }
}
</style>
