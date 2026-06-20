<template>
  <div class="page">

    <!-- Hero panel azul -->
    <section class="ledgerly-soft-panel hero">
      <div class="hero-left">
        <p class="hero-eyebrow">Reportes financieros</p>
        <h1 class="hero-title">Estado de Resultados</h1>
        <p class="hero-sub">{{ displayRange }}</p>
      </div>
      <!-- KPIs rápidos -->
      <div class="hero-kpis">
        <div class="kpi">
          <p class="kpi-label">Ingresos</p>
          <p class="kpi-val">{{ fmt(totalIngresos.total) }}</p>
        </div>
        <div class="kpi-divider"></div>
        <div class="kpi">
          <p class="kpi-label">Gastos totales</p>
          <p class="kpi-val">{{ fmt(totalGastos) }}</p>
        </div>
        <div class="kpi-divider"></div>
        <div class="kpi">
          <p class="kpi-label">Utilidad neta</p>
          <p class="kpi-val" :class="utilidad < 0 ? 'kpi-neg' : ''">{{ fmt(utilidad) }}</p>
        </div>
      </div>
    </section>

    <!-- Barra de filtros -->
    <section class="filter-bar ledgerly-surface">
      <div class="filter-group">
        <label class="filter-label">Año</label>
        <PeriodSelect v-model="year" :options="yearOptions" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Rango</label>
        <PeriodSelect v-model="range" :options="rangeOptions" />
      </div>
      <button class="btn btn-primary ml-auto" @click="exportExcel">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        Exportar Excel
      </button>
    </section>

    <!-- Loading / sin datos -->
    <div v-if="loading" class="empty-card ledgerly-surface">
      <svg class="spin h-6 w-6 text-blue-400 mb-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/></svg>
      Cargando datos…
    </div>
    <div v-else-if="!hasData" class="empty-card ledgerly-surface">
      <svg class="h-10 w-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>
      <h3>No hay datos para este rango</h3>
      <p>Selecciona un período con transacciones registradas.</p>
    </div>

    <!-- Tabla del estado de resultados -->
    <div v-else class="statement ledgerly-surface">
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th class="r">Movimientos</th>
            <th class="r">Total</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="sec in sections" :key="sec.key">
            <tr class="sec" :class="'sec-' + sec.tone">
              <td colspan="3">
                <span class="tag" :class="sec.tone">
                  <span class="dot" :class="sec.tone"></span>
                  {{ sec.title }}
                </span>
              </td>
            </tr>
            <tr v-for="(it, i) in sec.items" :key="sec.key + i" class="line">
              <td class="name">{{ it.name }}</td>
              <td class="qty">{{ it.count }}</td>
              <td class="amt">{{ fmt(it.total) }}</td>
            </tr>
            <tr class="subtotal">
              <td class="lbl">{{ sec.totalLabel }}</td>
              <td class="qty">{{ sec.total.count }}</td>
              <td class="amt" :class="sec.tone">{{ fmt(sec.total.total) }}</td>
            </tr>
            <tr v-if="sec.key === 'cost'" class="result mb-row">
              <td class="lbl">Margen bruto</td>
              <td></td>
              <td class="amt" :class="margenBruto >= 0 ? 'income' : 'expense'">{{ fmt(margenBruto) }}</td>
            </tr>
          </template>

          <tr class="result final">
            <td class="lbl">Utilidad operativa</td>
            <td></td>
            <td class="amt" :class="{ neg: utilidad < 0 }">{{ fmt(utilidad) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Footer resumen -->
      <div class="foot-summary">
        <div class="foot-kpi">
          <p class="e">Total ingresos</p>
          <p class="n income">{{ fmt(totalIngresos.total) }}</p>
        </div>
        <div class="foot-kpi">
          <p class="e">Total gastos</p>
          <p class="n expense">{{ fmt(totalGastos) }}</p>
        </div>
        <div class="foot-kpi">
          <p class="e">Margen bruto</p>
          <p class="n" :class="margenBrutoPct >= 55 ? 'income' : 'warn'">{{ margenBrutoPct.toFixed(1) }}%</p>
        </div>
        <div class="foot-kpi highlight">
          <p class="e">Utilidad neta</p>
          <p class="n brand">{{ fmt(utilidad) }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PeriodSelect from '@/components/common/PeriodSelect.vue'
// import { useAuthStore } from '@/stores/auth'   // ← descomenta para datos reales

const yearOptions = [{ value: '2026', label: 'Año 2026' }, { value: '2025', label: 'Año 2025' }]
const year = ref('2026')
const rangeOptions = [
  { value: 'ene-may', label: 'Ene - May' },
  { value: 'ene-jun', label: 'Ene - Jun' },
  { value: 'anual', label: 'año completo' }
]
const range = ref('ene-may')
const displayRange = computed(() => ({
  'ene-may': `Enero - Mayo ${year.value} - acumulado`,
  'ene-jun': `Enero - Junio ${year.value} - acumulado`,
  anual: `Enero - Diciembre ${year.value} - acumulado`
}[range.value] || `Enero - Mayo ${year.value} - acumulado`))
const rangoLabel = computed(() => `Enero – Mayo ${year.value} · acumulado`)
const loading = ref(false)


const ingresos = ref([
  { name: 'Ventas de servicios', count: 24, total: 198500 },
  { name: 'Otros ingresos', count: 8, total: 50000 },
])
const costosDirectos = ref([
  { name: 'Compra de mercadería', count: 18, total: 56900 },
  { name: 'Fletes y transporte', count: 12, total: 9150 },
])
const gastosOperativos = ref([
  { name: 'Sueldos y salarios', count: 12, total: 84000 },
  { name: 'Alquiler de local', count: 1, total: 18000 },
  { name: 'Servicios públicos', count: 6, total: 9420 },
  { name: 'Papelería y útiles', count: 9, total: 4875 },
])

const sumOf = (items) => items.reduce((a, b) => ({ count: a.count + b.count, total: a.total + b.total }), { count: 0, total: 0 })
const totalIngresos = computed(() => sumOf(ingresos.value))
const totalCostos = computed(() => sumOf(costosDirectos.value))
const totalGastosOp = computed(() => sumOf(gastosOperativos.value))
const margenBruto = computed(() => totalIngresos.value.total - totalCostos.value.total)
const totalGastos = computed(() => totalCostos.value.total + totalGastosOp.value.total)
const utilidad = computed(() => totalIngresos.value.total - totalGastos.value)
const margenBrutoPct = computed(() => totalIngresos.value.total ? (margenBruto.value / totalIngresos.value.total) * 100 : 0)
const hasData = computed(() => ingresos.value.length || costosDirectos.value.length || gastosOperativos.value.length)

const sections = computed(() => [
  { key: 'ing', title: 'Ingresos', tone: 'income', totalLabel: 'Total ingresos', items: ingresos.value, total: totalIngresos.value },
  { key: 'cost', title: 'Costos directos', tone: 'warn', totalLabel: 'Total costos directos', items: costosDirectos.value, total: totalCostos.value },
  { key: 'gas', title: 'Gastos operativos', tone: 'expense', totalLabel: 'Total gastos operativos', items: gastosOperativos.value, total: totalGastosOp.value },
].filter(s => s.items.length))

const fmt = (v) => new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL', minimumFractionDigits: 2 }).format(v || 0)

function exportExcel() {
  import('xlsx').then(XLSX => {
    const wb = XLSX.utils.book_new()

    const toRows = (items) => items.map(it => ({
      'Concepto': it.name,
      'Movimientos': it.count,
      'Total (L)': it.total
    }))

    const wsData = [
      ...toRows(ingresos.value),
      { 'Concepto': 'TOTAL INGRESOS', 'Movimientos': totalIngresos.value.count, 'Total (L)': totalIngresos.value.total },
      {},
      ...toRows(costosDirectos.value),
      { 'Concepto': 'TOTAL COSTOS DIRECTOS', 'Movimientos': totalCostos.value.count, 'Total (L)': totalCostos.value.total },
      { 'Concepto': 'MARGEN BRUTO', 'Movimientos': '', 'Total (L)': margenBruto.value },
      {},
      ...toRows(gastosOperativos.value),
      { 'Concepto': 'TOTAL GASTOS OPERATIVOS', 'Movimientos': totalGastosOp.value.count, 'Total (L)': totalGastosOp.value.total },
      {},
      { 'Concepto': 'UTILIDAD OPERATIVA', 'Movimientos': '', 'Total (L)': utilidad.value }
    ]

    const ws = XLSX.utils.json_to_sheet(wsData)
    ws['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Estado de Resultados')

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Ledgerly_EERR_${year.value}_${range.value}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}
</script>

<style scoped>
/* ── Layout de página ─────────────────────────────────── */
.page { display: flex; flex-direction: column; gap: 20px; padding: 28px 32px 44px; max-width: none; }

/* ── Hero panel azul ──────────────────────────────────── */
.hero { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 28px 32px; border-radius: 16px; flex-wrap: wrap; }
.hero-eyebrow { margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; opacity: .75; }
.hero-title { margin: 6px 0 4px; font-size: 26px; font-weight: 800; letter-spacing: -.02em; }
.hero-sub { margin: 0; font-size: 13px; opacity: .8; }

.hero-kpis { display: flex; align-items: center; gap: 0; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 20px; gap: 20px; flex-wrap: wrap; }
.kpi { text-align: center; }
.kpi-label { margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; opacity: .7; }
.kpi-val { margin: 4px 0 0; font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }
.kpi-neg { opacity: .85; text-decoration: underline dotted; }
.kpi-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.2); }

/* ── Barra de filtros ─────────────────────────────────── */
.filter-bar { display: flex; align-items: center; gap: 18px; padding: 16px 22px; border-radius: 12px; flex-wrap: wrap; }
.filter-group { display: flex; align-items: center; gap: 10px; }
.filter-label { font-size: 12px; font-weight: 600; color: var(--muted); white-space: nowrap; }
.filter-group :deep(.period-select) { min-width: 160px; }
.ml-auto { margin-left: auto; }

.btn { display: inline-flex; align-items: center; gap: 7px; border-radius: 9px; font-size: 13px; font-weight: 600; padding: 9px 16px; cursor: pointer; border: 1px solid transparent; transition: background .15s; }
.btn svg { width: 16px; height: 16px; stroke-width: 2.2; }
.btn-primary { background: var(--brand); color: #fff; }
.btn-primary:hover { background: var(--brand-700); }

/* ── Estados vacíos ───────────────────────────────────── */
.empty-card { border-radius: 14px; padding: 52px; text-align: center; color: var(--muted); display: flex; flex-direction: column; align-items: center; }
.empty-card svg { margin-bottom: 12px; }
.empty-card h3 { margin: 0 0 6px; font-size: 16px; font-weight: 600; color: var(--ink); }
.empty-card p { margin: 0; font-size: 13px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Tabla del estado de resultados ───────────────────── */
.statement { border-radius: 14px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead th { text-align: left; padding: 13px 24px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #fff; background: #1e40af; }
thead th.r { text-align: right; }

/* Sección con acento de color en el fondo */
.sec-income td { background: #f0fdf4; }
.sec-expense td { background: #fff7f7; }
.sec-warn td { background: #fffbeb; }
.sec td { padding: 18px 24px 6px; }
.sec .tag { display: inline-flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
.sec .dot { width: 6px; height: 6px; border-radius: 50%; }
.tag.income, .amt.income { color: var(--income); } .dot.income { background: var(--income); }
.tag.expense, .amt.expense { color: var(--expense); } .dot.expense { background: var(--expense); }
.tag.warn, .amt.warn { color: var(--warn); } .dot.warn { background: var(--warn); }

.line td { padding: 8px 24px; font-size: 13.5px; color: var(--ink-2); }
.line td.name { padding-left: 42px; }
.line td.qty { text-align: right; color: var(--faint); font-variant-numeric: tabular-nums; width: 130px; }
.line td.amt { text-align: right; color: var(--ink-2); font-variant-numeric: tabular-nums; width: 190px; }
.line:hover td { background: #fafcff; }

.subtotal td { padding: 10px 24px; font-size: 13.5px; border-top: 1px solid var(--line-2); }
.subtotal .lbl { font-weight: 600; color: var(--ink); }
.subtotal .qty { text-align: right; color: var(--muted); font-variant-numeric: tabular-nums; }
.subtotal .amt { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }

.result td { padding: 13px 24px; border-top: 1px solid var(--line); }
.result.mb-row td { background: #eff6ff; }
.result .lbl { font-size: 13.5px; font-weight: 600; color: var(--ink-2); }
.result .amt { text-align: right; font-size: 14px; font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
.result.final td { border-top: 2px solid var(--brand); background: linear-gradient(90deg, #eff6ff, #f8faff); padding: 18px 24px; }
.result.final .lbl { font-size: 15px; font-weight: 700; color: var(--brand-900); }
.result.final .amt { font-size: 17px; color: var(--brand-700); }
.result.final .amt.neg { color: var(--expense); }

/* ── Footer resumen ───────────────────────────────────── */
.foot-summary { border-top: 1px solid var(--line); padding: 18px 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; background: #f8faff; }
.foot-kpi.highlight { background: rgba(37,99,235,0.06); border-radius: 10px; padding: 10px 14px; }
.foot-kpi .e { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--faint); margin: 0; }
.foot-kpi .n { margin: 5px 0 0; font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums; }
.n.income { color: var(--income); } .n.expense { color: var(--expense); } .n.warn { color: var(--warn); } .n.brand { color: var(--brand-700); }

@media (max-width: 768px) {
  .page { padding: 16px 14px 32px; gap: 14px; }
  .hero { flex-direction: column; align-items: flex-start; padding: 22px 20px; }
  .hero-title { font-size: 20px; }
  .filter-bar { gap: 10px; }
  .filter-group :deep(.period-select) { width: 110px; }
  .foot-summary { grid-template-columns: 1fr 1fr; }
  thead th, .sec td, .line td, .subtotal td, .result td { padding-right: 12px; padding-left: 12px; }
  .line td.name { padding-left: 20px; }
}
</style>
