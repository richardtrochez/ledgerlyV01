<template>
  <div class="max-w-7xl mx-auto px-6 py-8 space-y-8">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Ventas y Gastos</h1>
        <p class="text-sm text-gray-500 mt-1">Registra ingresos y egresos por categoría</p>
      </div>
    </div>

    <!-- Formulario -->
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
      <h2 class="text-base font-semibold text-gray-900 mb-6">{{ editingId ? 'Editar Transacción' : 'Registrar Transacción' }}</h2>

      <div v-if="error" class="mb-5 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{{ error }}</div>
      <div v-if="success" class="mb-5 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">{{ success }}</div>

      <form @submit.prevent="saveTransaction">
        <div class="grid grid-cols-6 gap-4 items-end">

          <!-- Tipo -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
            <div class="flex flex-col gap-2 pt-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.type" type="radio" value="ingreso" class="w-4 h-4 text-green-600" />
                <span class="text-sm text-gray-700">Ingreso</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.type" type="radio" value="egreso" class="w-4 h-4 text-red-600" />
                <span class="text-sm text-gray-700">Egreso</span>
              </label>
            </div>
          </div>

          <!-- Período -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Período *</label>
            <select
              v-model="selectedPeriodId"
              @change="onPeriodChange"
              required
              class="block w-full rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            >
              <option value="">Seleccionar...</option>
              <option v-for="period in periods" :key="period._id" :value="period._id">
                {{ monthName(period.month) }} {{ period.year }}
              </option>
            </select>
          </div>

          <!-- Fecha -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
            <input
              v-model="form.fecha"
              type="date"
              required
              class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
          </div>

          <!-- Cuenta -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Cuenta *</label>
            <select
              v-model="form.accountCode"
              required
              class="block w-full rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            >
              <option value="">Seleccionar...</option>
              <optgroup v-if="form.type === 'ingreso'" label="INGRESOS">
                <option value="3000001">Café y Bebidas</option>
                <option value="3000002">Ventas de Brunch</option>
                <option value="3000003">Platos Fuertes</option>
              </optgroup>
              <optgroup v-if="form.type === 'egreso'" label="GASTOS">
                <option v-for="account in gastoAccounts" :key="account.code" :value="account.code">
                  {{ account.name }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Monto + Botón -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <span class="absolute left-3 top-2 text-gray-400 text-sm font-medium">L</span>
                <input
                  v-model="form.monto"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  class="block w-full rounded-md border-0 py-2 pl-7 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                :disabled="loading"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-semibold text-white transition-all disabled:opacity-50 whitespace-nowrap',
                  form.type === 'ingreso' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                ]"
              >
                {{ loading ? '...' : editingId ? 'Actualizar' : 'Guardar' }}
              </button>
              <button v-if="editingId" type="button" @click="resetForm"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 whitespace-nowrap">
                Cancelar
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>

    <!-- Tabla -->
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">

      <!-- Header tabla -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900">Transacciones</h3>
        <button
          v-if="transactions.length > 0"
          @click="exportToExcel"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Exportar Excel
        </button>
      </div>

      <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-gray-50">
          <tr>
            <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Fecha</th>
            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
            <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Monto</th>
            <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">

          <tr v-if="loadingTransactions">
            <td colspan="6" class="py-8 text-center text-sm text-gray-500">Cargando...</td>
          </tr>
          <tr v-else-if="!selectedPeriodId">
            <td colspan="6" class="py-8 text-center text-sm text-gray-500">Selecciona un período para ver las transacciones</td>
          </tr>
          <tr v-else-if="transactions.length === 0">
            <td colspan="6" class="py-8 text-center text-sm text-gray-500">No hay transacciones en este período</td>
          </tr>

          <tr v-else v-for="tx in transactions" :key="tx._id" class="hover:bg-gray-50">
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {{ formatDate(tx.fecha) }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm">
              <span :class="tx.type === 'ingreso' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'"
                class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset">
                {{ tx.type === 'ingreso' ? 'Ingreso' : 'Egreso' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-right font-semibold"
              :class="tx.type === 'ingreso' ? 'text-emerald-700' : 'text-red-600'">
              {{ tx.type === 'ingreso' ? '+' : '-' }}{{ formatCurrency(tx.monto) }}
            </td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <button @click="editTransaction(tx)" class="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
              <button @click="confirmDelete(tx)" class="text-red-600 hover:text-red-900">Eliminar</button>
            </td>
          </tr>

        </tbody>
      </table>
    </div>

    <!-- Modal eliminar -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30" @click="showDeleteModal = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Eliminar Transacción</h3>
        <p class="text-sm text-gray-700 mb-1">¿Está seguro que desea eliminar:</p>
        <p class="text-sm text-red-600 mb-5">Esta acción no se puede deshacer.</p>
        <div class="flex gap-3 justify-end">
          <button @click="showDeleteModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
          <button @click="handleDelete" :disabled="deleting" class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50">
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
  await loadGastoAccounts()
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
        periodId: selectedPeriodId.value,
        companyId: authStore.companyId || authStore.currentCompany?._id || '000000000000000000000001'
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

  XLSX.writeFile(wb, `Ledgerly_VentasGastos_${periodLabel}.xlsx`)
}
</script>