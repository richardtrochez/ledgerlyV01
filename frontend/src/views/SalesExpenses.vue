<template>
  <div class="sv-page">

    <!-- Hero panel -->
    <section class="ledgerly-soft-panel sv-hero">
      <div class="sv-hero-left">
        <p class="sv-eyebrow">Contabilidad</p>
        <h1 class="sv-title">Ventas y Gastos</h1>
        <p class="sv-sub">Registra ingresos y egresos por período</p>
      </div>
      <div class="sv-kpis" v-if="selectedPeriodId">
        <div class="sv-kpi">
          <p class="sv-kpi-label">Ingresos</p>
          <p class="sv-kpi-val sv-kpi-income">{{ formatCurrency(totalIngresos) }}</p>
        </div>
        <div class="sv-kpi-div"></div>
        <div class="sv-kpi">
          <p class="sv-kpi-label">Egresos</p>
          <p class="sv-kpi-val sv-kpi-expense">{{ formatCurrency(totalEgresos) }}</p>
        </div>
        <div class="sv-kpi-div"></div>
        <div class="sv-kpi">
          <p class="sv-kpi-label">Neto</p>
          <p class="sv-kpi-val" :class="totalIngresos - totalEgresos >= 0 ? 'sv-kpi-income' : 'sv-kpi-expense'">
            {{ formatCurrency(totalIngresos - totalEgresos) }}
          </p>
        </div>
      </div>
      <div class="sv-kpis sv-kpis-empty" v-else>
        <p>Selecciona un período para ver los totales</p>
      </div>
    </section>

    <!-- Formulario -->
    <div class="ledgerly-surface sv-card">
      <div class="sv-card-header">
        <div class="sv-card-title-row">
          <span class="sv-card-icon" :class="editingId ? 'edit-mode' : (form.type === 'ingreso' ? 'income-mode' : 'expense-mode')">
            <svg v-if="!editingId && form.type === 'ingreso'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m-8-8h16"/></svg>
            <svg v-else-if="!editingId" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </span>
          <h2 class="sv-card-title">{{ editingId ? 'Editar Transacción' : 'Nueva Transacción' }}</h2>
        </div>
      </div>

      <div v-if="error" class="sv-alert sv-alert-error">{{ error }}</div>
      <div v-if="success" class="sv-alert sv-alert-success">{{ success }}</div>

      <form @submit.prevent="saveTransaction" class="sv-form">

        <!-- Tipo -->
        <div class="sv-field">
          <label class="sv-label">Tipo *</label>
          <div class="sv-radio-group">
            <label class="sv-radio" :class="{ 'sv-radio-active-income': form.type === 'ingreso' }">
              <input v-model="form.type" type="radio" value="ingreso" />
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m-8-8h16"/></svg>
              Ingreso
            </label>
            <label class="sv-radio" :class="{ 'sv-radio-active-expense': form.type === 'egreso' }">
              <input v-model="form.type" type="radio" value="egreso" />
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
              Egreso
            </label>
          </div>
        </div>

        <!-- Período -->
        <div class="sv-field">
          <label class="sv-label">Período *</label>
          <select v-model="selectedPeriodId" @change="onPeriodChange" required class="sv-select">
            <option value="">Seleccionar...</option>
            <option v-for="period in periods" :key="period._id" :value="period._id">
              {{ monthName(period.month) }} {{ period.year }}
            </option>
          </select>
        </div>

        <!-- Fecha -->
        <div class="sv-field">
          <label class="sv-label">Fecha *</label>
          <input v-model="form.fecha" type="date" required class="sv-input" />
        </div>

        <!-- Cuenta -->
        <div class="sv-field">
          <label class="sv-label">Cuenta *</label>
          <select v-model="form.accountCode" required class="sv-select">
            <option value="">Seleccionar...</option>
            <optgroup v-if="form.type === 'ingreso'" label="INGRESOS">
              <option v-for="account in ingresoAccounts" :key="account.code" :value="account.code">
                {{ account.name }}
              </option>
              <!-- Fallback si la API aún no devuelve cuentas de ingreso -->
              <template v-if="ingresoAccounts.length === 0">
                <option value="ING-001">Ventas de servicios</option>
                <option value="ING-002">Otros ingresos</option>
              </template>
            </optgroup>
            <optgroup v-if="form.type === 'egreso'" label="GASTOS">
              <option v-for="account in gastoAccounts" :key="account.code" :value="account.code">
                {{ account.name }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- Monto + botones -->
        <div class="sv-field sv-field-monto">
          <label class="sv-label">Monto *</label>
          <div class="sv-monto-row">
            <div class="sv-monto-wrap">
              <span class="sv-currency-sign">L</span>
              <input v-model="form.monto" type="number" step="0.01" min="0.01" required placeholder="0.00" class="sv-input sv-input-monto" />
            </div>
            <button type="submit" :disabled="loading" class="sv-btn" :class="form.type === 'ingreso' ? 'sv-btn-income' : 'sv-btn-expense'">
              {{ loading ? '...' : editingId ? 'Actualizar' : 'Guardar' }}
            </button>
            <button v-if="editingId" type="button" @click="resetForm" class="sv-btn sv-btn-cancel">Cancelar</button>
          </div>
        </div>

      </form>
    </div>

    <!-- Tabla de transacciones -->
    <div class="ledgerly-surface sv-table-card">
      <div class="sv-table-header">
        <div>
          <h3 class="sv-table-title">Transacciones</h3>
          <p v-if="periodSelected" class="sv-table-sub">{{ periodSelected }}</p>
        </div>
        <button v-if="transactions.length > 0" @click="exportToExcel" class="sv-export-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Exportar Excel
        </button>
      </div>

      <div class="sv-table-wrap">
        <table class="sv-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th class="r">Monto</th>
              <th class="r">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingTransactions" class="sv-empty-row">
              <td colspan="4">Cargando...</td>
            </tr>
            <tr v-else-if="!selectedPeriodId" class="sv-empty-row">
              <td colspan="4">Selecciona un período para ver las transacciones</td>
            </tr>
            <tr v-else-if="transactions.length === 0" class="sv-empty-row">
              <td colspan="4">No hay transacciones en este período</td>
            </tr>
            <tr v-else v-for="tx in transactions" :key="tx._id" class="sv-row">
              <td class="sv-cell-date">{{ formatDate(tx.fecha) }}</td>
              <td>
                <span class="sv-badge" :class="tx.type === 'ingreso' ? 'sv-badge-income' : 'sv-badge-expense'">
                  {{ tx.type === 'ingreso' ? 'Ingreso' : 'Egreso' }}
                </span>
              </td>
              <td class="sv-cell-amount" :class="tx.type === 'ingreso' ? 'sv-amount-income' : 'sv-amount-expense'">
                {{ tx.type === 'ingreso' ? '+' : '-' }}{{ formatCurrency(tx.monto) }}
              </td>
              <td class="sv-cell-actions">
                <button @click="editTransaction(tx)" class="sv-action-edit">Editar</button>
                <button @click="confirmDelete(tx)" class="sv-action-delete">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal eliminar -->
    <div v-if="showDeleteModal" class="sv-modal-overlay" @click.self="showDeleteModal = false">
      <div class="sv-modal">
        <div class="sv-modal-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        </div>
        <h3>Eliminar Transacción</h3>
        <p>¿Está seguro que desea eliminar esta transacción?</p>
        <p class="sv-modal-warn">Esta acción no se puede deshacer.</p>
        <div class="sv-modal-actions">
          <button @click="showDeleteModal = false" class="sv-btn sv-btn-cancel">Cancelar</button>
          <button @click="handleDelete" :disabled="deleting" class="sv-btn sv-btn-danger">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import * as XLSX from 'xlsx'

const authStore = useAuthStore()
const API = 'http://localhost:4000/api'

const selectedPeriodId = ref('')
const periods = ref([])
const transactions = ref([])
const gastoAccounts = ref([])
const ingresoAccounts = ref([])   // ← nuevo: cuentas de ingreso desde la API
const loading = ref(false)
const loadingTransactions = ref(false)
const error = ref('')
const editingId = ref(null)
const success = ref('')
const showDeleteModal = ref(false)
const txToDelete = ref(null)
const deleting = ref(false)

const form = ref({
  type: 'ingreso',
  fecha: '',
  accountCode: '',
  descripcion: '',
  monto: ''
})

const totalIngresos = computed(() =>
  transactions.value.filter(tx => tx.type === 'ingreso').reduce((sum, tx) => sum + tx.monto, 0)
)
const totalEgresos = computed(() =>
  transactions.value.filter(tx => tx.type === 'egreso').reduce((sum, tx) => sum + tx.monto, 0)
)
const periodSelected = computed(() => {
  const period = periods.value.find(p => p._id === selectedPeriodId.value)
  return period ? `${monthName(period.month)} ${period.year}` : ''
})

onMounted(async () => {
  await loadPeriods()
  await Promise.all([loadGastoAccounts(), loadIngresoAccounts()])
})

async function loadPeriods() {
  try {
    const res = await fetch(`${API}/periods`, { headers: { 'Authorization': `Bearer ${authStore.token}` } })
    if (res.ok) { const data = await res.json(); periods.value = data.data || [] }
  } catch (err) { console.error(err) }
}

async function loadGastoAccounts() {
  try {
    const res = await fetch(`${API}/accounts/by-group?groups=gasto_operativo,costo_directo`, { headers: { 'Authorization': `Bearer ${authStore.token}` } })
    if (res.ok) { const data = await res.json(); gastoAccounts.value = data.data || [] }
  } catch (err) { console.error(err) }
}

async function loadIngresoAccounts() {
  try {
    const res = await fetch(`${API}/accounts/by-group?groups=ingreso`, { headers: { 'Authorization': `Bearer ${authStore.token}` } })
    if (res.ok) { const data = await res.json(); ingresoAccounts.value = data.data || [] }
  } catch (err) { console.error(err) }
}

async function onPeriodChange() {
  await loadTransactions()
}

async function loadTransactions() {
  if (!selectedPeriodId.value) { transactions.value = []; return }
  loadingTransactions.value = true
  try {
    const res = await fetch(`${API}/transactions?periodId=${selectedPeriodId.value}`, { headers: { 'Authorization': `Bearer ${authStore.token}` } })
    if (res.ok) { const data = await res.json(); transactions.value = data.data || [] }
  } catch (err) { console.error(err) } finally { loadingTransactions.value = false }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL', minimumFractionDigits: 2 }).format(value || 0)
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function monthName(month) {
  return ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][month] || month
}

function fixTimezone(dateString) {
  const date = new Date(dateString)
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toISOString()
}

function confirmDelete(tx) {
  txToDelete.value = tx
  showDeleteModal.value = true
}

async function handleDelete() {
  deleting.value = true
  try {
    const res = await fetch(`${API}/transactions/${txToDelete.value._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (res.ok) {
      transactions.value = transactions.value.filter(t => t._id !== txToDelete.value._id)
      showDeleteModal.value = false
      txToDelete.value = null
    }
  } catch (err) { console.error(err) } finally { deleting.value = false }
}

function editTransaction(tx) {
  editingId.value = tx._id
  form.value = {
    type: tx.type || 'ingreso',
    fecha: tx.fecha ? new Date(tx.fecha).toISOString().split('T')[0] : '',
    accountCode: tx.accountCode || '',
    monto: tx.monto || ''
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function saveTransaction() {
  error.value = ''
  success.value = ''

  if (!selectedPeriodId.value) { error.value = 'Selecciona un período'; return }
  if (!form.value.fecha || !form.value.accountCode || !form.value.monto) {
    error.value = 'Completa todos los campos requeridos'; return
  }

  loading.value = true
  try {
    const url = editingId.value ? `${API}/transactions/${editingId.value}` : `${API}/transactions`
    const method = editingId.value ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify({
        type: form.value.type,
        fecha: fixTimezone(form.value.fecha),
        accountCode: form.value.accountCode,
        descripcion: form.value.accountCode,
        monto: parseFloat(form.value.monto),
        periodId: selectedPeriodId.value
      })
    })
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Error al guardar') }
    success.value = editingId.value ? 'Transacción actualizada exitosamente' : `${form.value.type === 'ingreso' ? 'Ingreso' : 'Egreso'} guardado exitosamente`
    resetForm()
    await loadTransactions()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.message || 'Error al guardar'
  } finally { loading.value = false }
}

function resetForm() {
  form.value = { type: 'ingreso', fecha: '', accountCode: '', monto: '' }
  editingId.value = null
  error.value = ''
}

function exportToExcel() {
  const period = periods.value.find(p => p._id === selectedPeriodId.value)
  const periodLabel = period ? `${monthName(period.month)}_${period.year}` : 'todas'

  const ingresos = transactions.value.filter(t => t.type === 'ingreso')
  const egresos = transactions.value.filter(t => t.type === 'egreso')

  const toRows = (list) => list.map(t => ({
    'Fecha': formatDate(t.fecha),
    'Tipo': t.type === 'ingreso' ? 'Ingreso' : 'Egreso',
    'Cuenta': t.accountCode || '',
    'Monto (L)': t.monto || 0
  }))

  const wb = XLSX.utils.book_new()

  // Hoja Ingresos
  const wsIngresos = XLSX.utils.json_to_sheet(toRows(ingresos))
  wsIngresos['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsIngresos, 'Ingresos')

  // Hoja Egresos
  const wsEgresos = XLSX.utils.json_to_sheet(toRows(egresos))
  wsEgresos['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsEgresos, 'Egresos')

  // Hoja Resumen
  const resumen = [
    { 'Concepto': 'Total Ingresos', 'Monto (L)': totalIngresos.value },
    { 'Concepto': 'Total Egresos', 'Monto (L)': totalEgresos.value },
    { 'Concepto': 'Neto', 'Monto (L)': totalIngresos.value - totalEgresos.value }
  ]
  const wsResumen = XLSX.utils.json_to_sheet(resumen)
  wsResumen['!cols'] = [{ wch: 18 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

  descargarExcel(wb, `Ledgerly_VentasGastos_${periodLabel}.xlsx`)
}

function descargarExcel(wb, nombre) {
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* ── Página ──────────────────────────────────────── */
.sv-page { display: flex; flex-direction: column; gap: 20px; padding: 28px 32px 48px; }

/* ── Hero ────────────────────────────────────────── */
.sv-hero { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 28px 32px; border-radius: 16px; flex-wrap: wrap; }
.sv-eyebrow { margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; opacity: .75; }
.sv-title { margin: 6px 0 4px; font-size: 26px; font-weight: 800; letter-spacing: -.02em; }
.sv-sub { margin: 0; font-size: 13px; opacity: .8; }

.sv-kpis { display: flex; align-items: center; gap: 20px; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 20px; flex-wrap: wrap; }
.sv-kpis-empty { font-size: 12px; opacity: .65; }
.sv-kpi { text-align: center; }
.sv-kpi-label { margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; opacity: .7; }
.sv-kpi-val { margin: 4px 0 0; font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums; }
.sv-kpi-income { color: #86efac; }
.sv-kpi-expense { color: #fca5a5; }
.sv-kpi-div { width: 1px; height: 36px; background: rgba(255,255,255,0.2); }

/* ── Tarjeta de formulario ───────────────────────── */
.sv-card { border-radius: 14px; overflow: hidden; }
.sv-card-header { padding: 18px 24px 0; }
.sv-card-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.sv-card-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; }
.sv-card-icon svg { width: 16px; height: 16px; }
.income-mode { background: #dcfce7; color: #15803d; }
.expense-mode { background: #fee2e2; color: #b91c1c; }
.edit-mode { background: #eff6ff; color: #1d4ed8; }
.sv-card-title { margin: 0; font-size: 15px; font-weight: 700; color: var(--ink); }

.sv-alert { margin: 0 24px 16px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; }
.sv-alert-error { background: var(--color-danger-soft); color: var(--color-danger); border: 1px solid #fecdd3; }
.sv-alert-success { background: var(--color-success-soft); color: var(--color-success); border: 1px solid #bbf7d0; }

.sv-form { display: grid; grid-template-columns: auto 1fr 1fr 1fr 1.8fr; gap: 14px 16px; padding: 6px 24px 24px; align-items: end; }
.sv-field { display: flex; flex-direction: column; gap: 6px; }
.sv-field-monto { grid-column: span 1; }
.sv-label { font-size: 12px; font-weight: 600; color: var(--muted); }

.sv-radio-group { display: flex; flex-direction: column; gap: 6px; }
.sv-radio { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 500; color: var(--ink-2); cursor: pointer; padding: 7px 10px; border-radius: 8px; border: 1px solid var(--line); transition: all .15s; }
.sv-radio input { display: none; }
.sv-radio svg { width: 14px; height: 14px; }
.sv-radio-active-income { background: #dcfce7; border-color: #86efac; color: #15803d; font-weight: 600; }
.sv-radio-active-expense { background: #fee2e2; border-color: #fca5a5; color: #b91c1c; font-weight: 600; }

.sv-select, .sv-input {
  width: 100%; padding: 8px 12px; border-radius: 8px;
  border: 1px solid var(--line); background: var(--color-bg-surface);
  color: var(--ink); font-size: 13px;
  outline: none; transition: border-color .15s, box-shadow .15s;
}
.sv-select:focus, .sv-input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.sv-monto-row { display: flex; gap: 8px; align-items: stretch; }
.sv-monto-wrap { position: relative; flex: 1; }
.sv-currency-sign { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: var(--muted); pointer-events: none; }
.sv-input-monto { padding-left: 26px; }

.sv-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; border: 1px solid transparent; white-space: nowrap; transition: all .15s;
}
.sv-btn:disabled { opacity: .5; cursor: not-allowed; }
.sv-btn-income { background: #16a34a; color: #fff; }
.sv-btn-income:hover:not(:disabled) { background: #15803d; }
.sv-btn-expense { background: #dc2626; color: #fff; }
.sv-btn-expense:hover:not(:disabled) { background: #b91c1c; }
.sv-btn-cancel { background: transparent; color: var(--ink-2); border-color: var(--line); }
.sv-btn-cancel:hover { background: var(--color-bg-surface-soft); }
.sv-btn-danger { background: #dc2626; color: #fff; }
.sv-btn-danger:hover:not(:disabled) { background: #b91c1c; }

/* ── Tabla ───────────────────────────────────────── */
.sv-table-card { border-radius: 14px; overflow: hidden; }
.sv-table-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--line-2); }
.sv-table-title { margin: 0; font-size: 15px; font-weight: 700; color: var(--ink); }
.sv-table-sub { margin: 2px 0 0; font-size: 12px; color: var(--muted); }

.sv-export-btn {
  display: inline-flex; align-items: center; gap: 7px; padding: 7px 14px;
  border-radius: 8px; font-size: 13px; font-weight: 600;
  color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0;
  cursor: pointer; transition: all .15s;
}
.sv-export-btn svg { width: 15px; height: 15px; }
.sv-export-btn:hover { background: #d1fae5; }

.sv-table-wrap { overflow-x: auto; }
.sv-table { width: 100%; border-collapse: collapse; }
.sv-table thead th {
  padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .05em; color: #fff;
  background: #1e40af;
}
.sv-table thead th.r { text-align: right; }
.sv-empty-row td { padding: 40px; text-align: center; font-size: 13px; color: var(--muted); }
.sv-row td { padding: 12px 20px; border-bottom: 1px solid var(--line-2); font-size: 13.5px; color: var(--ink-2); }
.sv-row:last-child td { border-bottom: none; }
.sv-row:hover td { background: #f8faff; }
.sv-cell-date { font-weight: 500; color: var(--ink); }
.sv-cell-amount { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
.sv-cell-actions { text-align: right; }
.sv-amount-income { color: var(--income); }
.sv-amount-expense { color: var(--expense); }

.sv-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.sv-badge-income { background: #dcfce7; color: #15803d; }
.sv-badge-expense { background: #fee2e2; color: #b91c1c; }

.sv-action-edit { color: var(--brand); font-size: 12px; font-weight: 600; background: none; border: none; cursor: pointer; margin-right: 12px; }
.sv-action-edit:hover { color: var(--brand-700); text-decoration: underline; }
.sv-action-delete { color: var(--expense); font-size: 12px; font-weight: 600; background: none; border: none; cursor: pointer; }
.sv-action-delete:hover { text-decoration: underline; }

/* ── Modal ───────────────────────────────────────── */
.sv-modal-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.45); }
.sv-modal { background: #fff; border-radius: 16px; padding: 28px 28px 24px; width: 100%; max-width: 360px; margin: 0 16px; box-shadow: 0 20px 60px rgba(15,23,42,0.2); text-align: center; }
.sv-modal-icon { width: 44px; height: 44px; border-radius: 50%; background: #fee2e2; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: #dc2626; }
.sv-modal-icon svg { width: 22px; height: 22px; }
.sv-modal h3 { margin: 0 0 8px; font-size: 17px; font-weight: 700; color: var(--ink); }
.sv-modal p { margin: 0 0 4px; font-size: 13px; color: var(--ink-2); }
.sv-modal-warn { color: var(--expense) !important; font-weight: 600; margin-bottom: 20px !important; }
.sv-modal-actions { display: flex; gap: 10px; justify-content: center; }

@media (max-width: 768px) {
  .sv-page { padding: 16px 14px 36px; gap: 14px; }
  .sv-hero { flex-direction: column; align-items: flex-start; padding: 22px 20px; }
  .sv-form { grid-template-columns: 1fr 1fr; }
  .sv-field-monto { grid-column: span 2; }
  .sv-monto-row { flex-wrap: wrap; }
}
</style>
