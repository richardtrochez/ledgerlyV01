<template>
  <div class="cp-page">

    <!-- Hero panel -->
    <section class="ledgerly-soft-panel cp-hero">
      <div class="cp-hero-left">
        <p class="cp-eyebrow">Contabilidad</p>
        <h1 class="cp-title">Compras</h1>
        <p class="cp-sub">Registro de facturas de proveedores por período</p>
      </div>
      <div class="cp-hero-actions">
        <select v-model="selectedPeriodId" @change="onPeriodChange" class="cp-period-select">
          <option value="">Seleccionar período...</option>
          <option v-for="period in periods" :key="period._id" :value="period._id">
            {{ monthName(period.month) }} {{ period.year }}
          </option>
        </select>
        <button type="button" @click="showNewPeriodModal = true" class="cp-new-period-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m-8-8h16"/></svg>
          Nuevo período
        </button>
      </div>
    </section>

    <!-- Formulario -->
    <div class="ledgerly-surface cp-card">
      <div class="cp-card-header">
        <span class="cp-card-icon" :class="editingId ? 'edit-mode' : 'default-mode'">
          <svg v-if="!editingId" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4h8l3 3v13H5V4h3Zm0 0a2 2 0 0 0 4 0"/></svg>
          <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </span>
        <h2 class="cp-card-title">{{ editingId ? 'Editar Compra' : 'Registrar Compra' }}</h2>
      </div>

      <div v-if="error" class="cp-alert cp-alert-error">{{ error }}</div>
      <div v-if="success" class="cp-alert cp-alert-success">{{ success }}</div>

      <form @submit.prevent="savePurchase" class="cp-form">

        <!-- Fila 1: datos del documento -->
        <div class="cp-row">
          <div class="cp-field">
            <label class="cp-label">Fecha *</label>
            <input v-model="form.fechaDocumento" type="date" required class="cp-input" />
          </div>
          <div class="cp-field cp-field-wide">
            <label class="cp-label">Proveedor *</label>
            <input v-model="form.proveedor" type="text" required placeholder="Nombre del proveedor" class="cp-input" />
          </div>
          <div class="cp-field">
            <label class="cp-label">No. Factura *</label>
            <input v-model="form.numeroFactura" type="text" required class="cp-input" />
          </div>
          <div class="cp-field">
            <label class="cp-label">RTN Proveedor *</label>
            <input v-model="form.rtnProveedor" type="text" required class="cp-input" />
          </div>
        </div>

        <!-- Fila 2: ISV -->
        <div class="cp-row cp-row-isv">
          <div class="cp-field">
            <label class="cp-label">Exento de ISV</label>
            <div class="cp-money">
              <span class="cp-sign">L</span>
              <input v-model="form.subtotalExento" type="number" step="0.01" min="0" placeholder="0.00" @input="recalcular" class="cp-input cp-input-money" />
            </div>
          </div>
          <div class="cp-field">
            <label class="cp-label">Gravado 15%</label>
            <div class="cp-money">
              <span class="cp-sign">L</span>
              <input v-model="form.subtotal15" type="number" step="0.01" min="0" placeholder="0.00" @input="recalcular" class="cp-input cp-input-money" />
            </div>
          </div>
          <div class="cp-field">
            <label class="cp-label cp-label-muted">ISV 15%</label>
            <div class="cp-computed">L {{ isv15.toFixed(2) }}</div>
          </div>
          <div class="cp-field">
            <label class="cp-label">Gravado 18%</label>
            <div class="cp-money">
              <span class="cp-sign">L</span>
              <input v-model="form.subtotal18" type="number" step="0.01" min="0" placeholder="0.00" @input="recalcular" class="cp-input cp-input-money" />
            </div>
          </div>
          <div class="cp-field">
            <label class="cp-label cp-label-muted">ISV 18%</label>
            <div class="cp-computed">L {{ isv18.toFixed(2) }}</div>
          </div>
        </div>

        <!-- Fila 3: Total + botones -->
        <div class="cp-row cp-row-footer">
          <div class="cp-total-display">
            <span class="cp-total-label">Total bruto</span>
            <span class="cp-total-val">L {{ totalBruto.toFixed(2) }}</span>
          </div>
          <div class="cp-form-actions">
            <button v-if="editingId" type="button" @click="resetForm" class="cp-btn cp-btn-cancel">Cancelar</button>
            <button type="submit" :disabled="loading" class="cp-btn cp-btn-primary">
              {{ loading ? '...' : editingId ? 'Actualizar' : 'Guardar compra' }}
            </button>
          </div>
        </div>

      </form>
    </div>

    <!-- Modal nuevo período -->
    <PeriodModal :isOpen="showNewPeriodModal" @close="showNewPeriodModal = false" @created="onPeriodCreated" />

    <!-- Tabla -->
    <div class="ledgerly-surface cp-table-card">
      <div class="cp-table-header">
        <div>
          <h3 class="cp-table-title">Registro de compras</h3>
          <p v-if="selectedPeriodId" class="cp-table-sub">
            {{ periods.find(p => p._id === selectedPeriodId) ? monthName(periods.find(p => p._id === selectedPeriodId).month) + ' ' + periods.find(p => p._id === selectedPeriodId).year : '' }}
          </p>
        </div>
        <button v-if="purchases.length > 0" @click="exportToExcel" class="cp-export-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Exportar Excel
        </button>
      </div>

      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>No. Factura</th>
              <th class="r">Total</th>
              <th class="r">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingPurchases" class="cp-empty-row"><td colspan="5">Cargando...</td></tr>
            <tr v-else-if="!selectedPeriodId" class="cp-empty-row"><td colspan="5">Selecciona un período para ver las compras</td></tr>
            <tr v-else-if="purchases.length === 0" class="cp-empty-row"><td colspan="5">No hay compras en este período</td></tr>
            <tr v-else v-for="purchase in purchases" :key="purchase._id" class="cp-row-data">
              <td class="cp-cell-date">{{ formatDate(purchase.fechaDocumento) }}</td>
              <td class="cp-cell-main">{{ purchase.proveedor }}</td>
              <td class="cp-cell-muted">{{ purchase.numeroFactura }}</td>
              <td class="cp-cell-amount">{{ formatCurrency(purchase.totalBruto) }}</td>
              <td class="cp-cell-actions">
                <button @click="editPurchase(purchase)" class="cp-action-edit">Editar</button>
                <button @click="confirmDelete(purchase)" class="cp-action-delete">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal eliminar -->
    <div v-if="showDeleteModal" class="cp-modal-overlay" @click.self="showDeleteModal = false">
      <div class="cp-modal">
        <div class="cp-modal-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        </div>
        <h3>Eliminar Compra</h3>
        <p>¿Eliminar la compra de <strong>{{ purchaseToDelete?.proveedor }}</strong>?</p>
        <p class="cp-modal-sub">Factura: {{ purchaseToDelete?.numeroFactura }}</p>
        <p class="cp-modal-warn">Esta acción no se puede deshacer.</p>
        <div class="cp-modal-actions">
          <button @click="showDeleteModal = false" class="cp-btn cp-btn-cancel">Cancelar</button>
          <button @click="handleDelete" :disabled="deleting" class="cp-btn cp-btn-danger">
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
import PeriodModal from '@/components/periods/Periodmodal.vue'
import * as XLSX from 'xlsx'

const authStore = useAuthStore()
const API = 'http://localhost:4000/api'

const selectedPeriodId = ref('')
const periods = ref([])
const purchases = ref([])
const loading = ref(false)
const loadingPurchases = ref(false)
const error = ref('')
const success = ref('')
const showNewPeriodModal = ref(false)
const showDeleteModal = ref(false)
const purchaseToDelete = ref(null)
const deleting = ref(false)
const editingId = ref(null)

const form = ref({
  fechaDocumento: '',
  proveedor: '',
  numeroFactura: '',
  rtnProveedor: '',
  subtotalExento: '',
  subtotal15: '',
  subtotal18: ''
})

const isv15 = computed(() => Math.round((parseFloat(form.value.subtotal15) || 0) * 0.15 * 100) / 100)
const isv18 = computed(() => Math.round((parseFloat(form.value.subtotal18) || 0) * 0.18 * 100) / 100)
const totalBruto = computed(() => {
  const exento = parseFloat(form.value.subtotalExento) || 0
  const sub15 = parseFloat(form.value.subtotal15) || 0
  const sub18 = parseFloat(form.value.subtotal18) || 0
  return exento + sub15 + isv15.value + sub18 + isv18.value
})

function recalcular() {}

onMounted(async () => { await loadPeriods() })

async function loadPeriods() {
  try {
    const res = await fetch(`${API}/periods`, { headers: { 'Authorization': `Bearer ${authStore.token}` } })
    if (res.ok) { const data = await res.json(); periods.value = data.data || [] }
  } catch (err) { console.error(err) }
}

async function onPeriodChange() { await loadPurchases() }

async function onPeriodCreated(newPeriod) {
  await loadPeriods()
  selectedPeriodId.value = newPeriod._id
  await loadPurchases()
}

async function loadPurchases() {
  if (!selectedPeriodId.value) { purchases.value = []; return }
  loadingPurchases.value = true
  try {
    const res = await fetch(`${API}/purchases?periodId=${selectedPeriodId.value}`, { headers: { 'Authorization': `Bearer ${authStore.token}` } })
    if (res.ok) { const data = await res.json(); purchases.value = data.data || [] }
  } catch (err) { console.error(err) } finally { loadingPurchases.value = false }
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

function editPurchase(purchase) {
  editingId.value = purchase._id
  form.value = {
    fechaDocumento: purchase.fechaDocumento ? new Date(purchase.fechaDocumento).toISOString().split('T')[0] : '',
    proveedor: purchase.proveedor || '',
    numeroFactura: purchase.numeroFactura || '',
    rtnProveedor: purchase.rtnProveedor || '',
    subtotalExento: purchase.baseExenta || '',
    subtotal15: purchase.baseImponible15 || '',
    subtotal18: purchase.baseImponible18 || ''
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function confirmDelete(purchase) {
  purchaseToDelete.value = purchase
  showDeleteModal.value = true
}

async function handleDelete() {
  deleting.value = true
  try {
    const res = await fetch(`${API}/purchases/${purchaseToDelete.value._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (res.ok) {
      purchases.value = purchases.value.filter(p => p._id !== purchaseToDelete.value._id)
      showDeleteModal.value = false
      purchaseToDelete.value = null
    }
  } catch (err) { console.error(err) } finally { deleting.value = false }
}

async function savePurchase() {
  error.value = ''
  success.value = ''

  if (!selectedPeriodId.value) { error.value = 'Selecciona un período'; return }
  if (!form.value.fechaDocumento || !form.value.proveedor || !form.value.numeroFactura || !form.value.rtnProveedor) {
    error.value = 'Completa todos los campos requeridos'; return
  }
  if (totalBruto.value <= 0) { error.value = 'Ingresa al menos un subtotal'; return }

  loading.value = true
  try {
    const body = {
      fechaDocumento: fixTimezone(form.value.fechaDocumento),
      fechaContabilizacion: fixTimezone(form.value.fechaDocumento),
      proveedor: form.value.proveedor,
      numeroFactura: form.value.numeroFactura,
      rtnProveedor: form.value.rtnProveedor,
      descripcion: form.value.proveedor,
      baseExenta: parseFloat(form.value.subtotalExento) || 0,
      baseImponible15: parseFloat(form.value.subtotal15) || 0,
      isv15: isv15.value,
      baseImponible18: parseFloat(form.value.subtotal18) || 0,
      isv18: isv18.value,
      gastoNoDeducible: 0,
      periodId: selectedPeriodId.value
    }

    const url = editingId.value ? `${API}/purchases/${editingId.value}` : `${API}/purchases`
    const method = editingId.value ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify(body)
    })
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Error al guardar') }
    success.value = editingId.value ? 'Compra actualizada exitosamente' : 'Compra guardada exitosamente'
    resetForm()
    await loadPurchases()
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = err.message || 'Error al guardar'
  } finally { loading.value = false }
}

function resetForm() {
  form.value = { fechaDocumento: '', proveedor: '', numeroFactura: '', rtnProveedor: '', subtotalExento: '', subtotal15: '', subtotal18: '' }
  editingId.value = null
  error.value = ''
}

function exportToExcel() {
  const period = periods.value.find(p => p._id === selectedPeriodId.value)
  const periodLabel = period ? `${monthName(period.month)}_${period.year}` : 'todas'

  const rows = purchases.value.map(p => ({
    'Fecha': formatDate(p.fechaDocumento),
    'Proveedor': p.proveedor,
    'RTN Proveedor': p.rtnProveedor,
    'No. Factura': p.numeroFactura,
    'CAI': p.CAI || '',
    'Exento ISV (L)': p.baseExenta || 0,
    'Subtotal 15% (L)': p.baseImponible15 || 0,
    'ISV 15% (L)': p.isv15 || 0,
    'Subtotal 18% (L)': p.baseImponible18 || 0,
    'ISV 18% (L)': p.isv18 || 0,
    'Crédito Fiscal (L)': p.creditoFiscal || 0,
    'Total Bruto (L)': p.totalBruto || 0
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 22 },
    { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
    { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 14 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Compras')
  descargarExcel(wb, `Ledgerly_Compras_${periodLabel}.xlsx`)
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
/* ── Página ─────────────────────────────────── */
.cp-page { display: flex; flex-direction: column; gap: 20px; padding: 28px 32px 48px; }

/* ── Hero ───────────────────────────────────── */
.cp-hero { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 28px 32px; border-radius: 16px; flex-wrap: wrap; }
.cp-eyebrow { margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; opacity: .75; }
.cp-title { margin: 6px 0 4px; font-size: 26px; font-weight: 800; letter-spacing: -.02em; }
.cp-sub { margin: 0; font-size: 13px; opacity: .8; }

.cp-hero-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.cp-period-select {
  padding: 9px 14px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.15); color: #fff; font-size: 13px; font-weight: 500;
  outline: none; cursor: pointer; min-width: 190px;
}
.cp-period-select option { color: #0f172a; background: #fff; }
.cp-period-select:focus { border-color: rgba(255,255,255,0.6); }
.cp-new-period-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px;
  border-radius: 9px; border: 1px solid rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.12); color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .15s;
}
.cp-new-period-btn svg { width: 14px; height: 14px; }
.cp-new-period-btn:hover { background: rgba(255,255,255,0.22); }

/* ── Tarjeta formulario ─────────────────────── */
.cp-card { border-radius: 14px; overflow: hidden; }
.cp-card-header { display: flex; align-items: center; gap: 10px; padding: 18px 24px 10px; }
.cp-card-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; }
.cp-card-icon svg { width: 16px; height: 16px; }
.default-mode { background: #eff6ff; color: #1d4ed8; }
.edit-mode { background: #fef3c7; color: #b45309; }
.cp-card-title { margin: 0; font-size: 15px; font-weight: 700; color: var(--ink); }

.cp-alert { margin: 0 24px 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; }
.cp-alert-error { background: var(--color-danger-soft); color: var(--color-danger); border: 1px solid #fecdd3; }
.cp-alert-success { background: var(--color-success-soft); color: var(--color-success); border: 1px solid #bbf7d0; }

.cp-form { padding: 8px 24px 22px; display: flex; flex-direction: column; gap: 16px; }
.cp-row { display: flex; gap: 14px; align-items: end; flex-wrap: wrap; }
.cp-row-isv { padding-top: 16px; border-top: 1px solid var(--line-2); }
.cp-row-footer { padding-top: 16px; border-top: 1px solid var(--line-2); justify-content: space-between; align-items: center; }
.cp-field { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 130px; }
.cp-field-wide { flex: 2; }
.cp-label { font-size: 12px; font-weight: 600; color: var(--muted); }
.cp-label-muted { color: var(--faint); }

.cp-input {
  width: 100%; padding: 8px 12px; border-radius: 8px;
  border: 1px solid var(--line); background: var(--color-bg-surface);
  color: var(--ink); font-size: 13px; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.cp-input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.cp-money { position: relative; }
.cp-sign { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: var(--muted); pointer-events: none; }
.cp-input-money { padding-left: 26px; }
.cp-computed { padding: 8px 12px; border-radius: 8px; background: var(--color-bg-surface-soft); border: 1px solid var(--line-2); font-size: 13px; font-weight: 600; color: var(--ink-2); }

.cp-total-display { display: flex; align-items: center; gap: 12px; }
.cp-total-label { font-size: 13px; font-weight: 600; color: var(--muted); }
.cp-total-val { padding: 8px 18px; border-radius: 9px; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 14px; font-weight: 700; color: #1e40af; font-variant-numeric: tabular-nums; }
.cp-form-actions { display: flex; gap: 10px; }

.cp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all .15s; }
.cp-btn:disabled { opacity: .5; cursor: not-allowed; }
.cp-btn-primary { background: var(--brand); color: #fff; }
.cp-btn-primary:hover:not(:disabled) { background: var(--brand-700); }
.cp-btn-cancel { background: transparent; color: var(--ink-2); border-color: var(--line); }
.cp-btn-cancel:hover { background: var(--color-bg-surface-soft); }
.cp-btn-danger { background: #dc2626; color: #fff; }
.cp-btn-danger:hover:not(:disabled) { background: #b91c1c; }

/* ── Tabla ──────────────────────────────────── */
.cp-table-card { border-radius: 14px; overflow: hidden; }
.cp-table-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--line-2); }
.cp-table-title { margin: 0; font-size: 15px; font-weight: 700; color: var(--ink); }
.cp-table-sub { margin: 2px 0 0; font-size: 12px; color: var(--muted); }
.cp-export-btn { display: inline-flex; align-items: center; gap: 7px; padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; cursor: pointer; transition: all .15s; }
.cp-export-btn svg { width: 15px; height: 15px; }
.cp-export-btn:hover { background: #d1fae5; }

.cp-table-wrap { overflow-x: auto; }
.cp-table { width: 100%; border-collapse: collapse; }
.cp-table thead th { padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #fff; background: #1e40af; }
.cp-table thead th.r { text-align: right; }
.cp-empty-row td { padding: 40px; text-align: center; font-size: 13px; color: var(--muted); }
.cp-row-data td { padding: 12px 20px; border-bottom: 1px solid var(--line-2); font-size: 13.5px; }
.cp-row-data:last-child td { border-bottom: none; }
.cp-row-data:hover td { background: #f8faff; }
.cp-cell-date { font-weight: 500; color: var(--ink); white-space: nowrap; }
.cp-cell-main { color: var(--ink); font-weight: 500; }
.cp-cell-muted { color: var(--muted); }
.cp-cell-amount { text-align: right; font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; white-space: nowrap; }
.cp-cell-actions { text-align: right; white-space: nowrap; }
.cp-action-edit { color: var(--brand); font-size: 12px; font-weight: 600; background: none; border: none; cursor: pointer; margin-right: 12px; }
.cp-action-edit:hover { text-decoration: underline; }
.cp-action-delete { color: var(--expense); font-size: 12px; font-weight: 600; background: none; border: none; cursor: pointer; }
.cp-action-delete:hover { text-decoration: underline; }

/* ── Modal ──────────────────────────────────── */
.cp-modal-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.45); }
.cp-modal { background: #fff; border-radius: 16px; padding: 28px; width: 100%; max-width: 380px; margin: 0 16px; box-shadow: 0 20px 60px rgba(15,23,42,0.2); text-align: center; }
.cp-modal-icon { width: 44px; height: 44px; border-radius: 50%; background: #fee2e2; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: #dc2626; }
.cp-modal-icon svg { width: 22px; height: 22px; }
.cp-modal h3 { margin: 0 0 8px; font-size: 17px; font-weight: 700; color: var(--ink); }
.cp-modal p { margin: 0 0 4px; font-size: 13px; color: var(--ink-2); }
.cp-modal-sub { color: var(--muted) !important; font-size: 12px !important; }
.cp-modal-warn { color: var(--expense) !important; font-weight: 600; margin: 12px 0 20px !important; }
.cp-modal-actions { display: flex; gap: 10px; justify-content: center; }

@media (max-width: 768px) {
  .cp-page { padding: 16px 14px 36px; gap: 14px; }
  .cp-hero { flex-direction: column; align-items: flex-start; padding: 22px 20px; }
  .cp-form { padding: 8px 16px 18px; }
  .cp-row { flex-direction: column; }
  .cp-field, .cp-field-wide { min-width: unset; flex: none; width: 100%; }
}
</style>
