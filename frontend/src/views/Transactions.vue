<template>
  <div class="max-w-7xl mx-auto px-6 py-8 space-y-8">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Compras</h1>
        <p class="text-sm text-gray-500 mt-1">Registra las compras del período</p>
      </div>
    </div>

    <!-- Selector de período -->
    <div class="flex items-center gap-3">
      <select
        v-model="selectedPeriodId"
        @change="onPeriodChange"
        class="rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
      >
        <option value="">Seleccionar período...</option>
        <option v-for="period in periods" :key="period._id" :value="period._id">
          {{ monthName(period.month) }} {{ period.year }}
        </option>
      </select>
      <button
        type="button"
        @click="showNewPeriodModal = true"
        class="px-3 py-2 rounded-md text-sm font-semibold text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >+ Nuevo período</button>
    </div>

    <!-- Formulario -->
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
      <h2 class="text-base font-semibold text-gray-900 mb-6">{{ editingId ? 'Editar Compra' : 'Registrar Compra' }}</h2>

      <div v-if="error" class="mb-5 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{{ error }}</div>
      <div v-if="success" class="mb-5 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">{{ success }}</div>

      <form @submit.prevent="savePurchase">
        <div class="grid grid-cols-10 gap-4 items-end">

          <!-- Fecha documento -->
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
            <input
              v-model="form.fechaDocumento"
              type="date"
              required
              class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
          </div>

          <!-- Proveedor -->
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
            <input
              v-model="form.proveedor"
              type="text"
              required
              placeholder="Nombre del proveedor"
              class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
          </div>

          <!-- No. Factura -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">No. Factura *</label>
            <input
              v-model="form.numeroFactura"
              type="text"
              required
              class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
          </div>

          <!-- RTN -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">RTN Proveedor *</label>
            <input
              v-model="form.rtnProveedor"
              type="text"
              required
              class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
          </div>

        </div>

        <!-- Segunda fila: ISV -->
        <div class="grid grid-cols-10 gap-4 items-end mt-4 pt-4 border-t border-gray-100">

          <!-- Exento -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Exento de ISV</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-400 text-sm font-medium">L</span>
              <input v-model="form.subtotalExento" type="number" step="0.01" min="0" placeholder="0.00" @input="recalcular"
                class="block w-full rounded-md border-0 py-2 pl-7 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
            </div>
          </div>

          <!-- Subtotal 15% -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Gravado 15%</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-400 text-sm font-medium">L</span>
              <input v-model="form.subtotal15" type="number" step="0.01" min="0" placeholder="0.00" @input="recalcular"
                class="block w-full rounded-md border-0 py-2 pl-7 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
            </div>
          </div>

          <!-- ISV 15% calculado -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-500 mb-2">ISV 15%</label>
            <div class="rounded-md bg-gray-50 ring-1 ring-inset ring-gray-200 py-2 px-3 text-sm text-gray-600 font-medium">
              L {{ isv15.toFixed(2) }}
            </div>
          </div>

          <!-- Subtotal 18% -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Gravado 18%</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-400 text-sm font-medium">L</span>
              <input v-model="form.subtotal18" type="number" step="0.01" min="0" placeholder="0.00" @input="recalcular"
                class="block w-full rounded-md border-0 py-2 pl-7 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
            </div>
          </div>

          <!-- ISV 18% calculado -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-500 mb-2">ISV 18%</label>
            <div class="rounded-md bg-gray-50 ring-1 ring-inset ring-gray-200 py-2 px-3 text-sm text-gray-600 font-medium">
              L {{ isv18.toFixed(2) }}
            </div>
          </div>

        </div>

        <!-- Tercera fila: Total y botones -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-700">Total:</span>
            <div class="rounded-md bg-blue-50 ring-1 ring-inset ring-blue-200 py-2 px-4 text-sm text-blue-900 font-bold min-w-[120px]">
              L {{ totalBruto.toFixed(2) }}
            </div>
          </div>
          <div class="flex gap-3">
            <button v-if="editingId" type="button" @click="resetForm"
              class="px-4 py-2 rounded-md text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" :disabled="loading"
              class="px-5 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50">
              {{ loading ? '...' : editingId ? 'Actualizar' : 'Guardar compra' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Modal nuevo período -->
    <PeriodModal
      :isOpen="showNewPeriodModal"
      @close="showNewPeriodModal = false"
      @created="onPeriodCreated"
    />

    <!-- Tabla -->
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">

      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900">Compras</h3>
        <button
          v-if="purchases.length > 0"
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
            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Proveedor</th>
            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">No. Factura</th>
            <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Total</th>
            <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">

          <tr v-if="loadingPurchases">
            <td colspan="5" class="py-8 text-center text-sm text-gray-500">Cargando...</td>
          </tr>
          <tr v-else-if="!selectedPeriodId">
            <td colspan="5" class="py-8 text-center text-sm text-gray-500">Selecciona un período para ver las compras</td>
          </tr>
          <tr v-else-if="purchases.length === 0">
            <td colspan="5" class="py-8 text-center text-sm text-gray-500">No hay compras en este período</td>
          </tr>

          <tr v-else v-for="purchase in purchases" :key="purchase._id" class="hover:bg-gray-50">
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
              {{ formatDate(purchase.fechaDocumento) }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
              {{ purchase.proveedor }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              {{ purchase.numeroFactura }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-right font-semibold text-gray-900">
              {{ formatCurrency(purchase.totalBruto) }}
            </td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <button @click="editPurchase(purchase)" class="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
              <button @click="confirmDelete(purchase)" class="text-red-600 hover:text-red-900">Eliminar</button>
            </td>
          </tr>

        </tbody>
      </table>
    </div>

    <!-- Modal eliminar -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30" @click="showDeleteModal = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Eliminar Compra</h3>
        <p class="text-sm text-gray-700 mb-1">¿Está seguro que desea eliminar la compra de:</p>
        <p class="text-sm font-semibold text-gray-900 mb-1">{{ purchaseToDelete?.proveedor }}</p>
        <p class="text-sm text-gray-500 mb-1">Factura: {{ purchaseToDelete?.numeroFactura }}</p>
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
import PeriodModal from '@/components/periods/PeriodModal.vue'
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
    subtotalExento: purchase.subtotalExento || '',
    subtotal15: purchase.subtotal15 || '',
    subtotal18: purchase.subtotal18 || ''
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
      subtotalExento: parseFloat(form.value.subtotalExento) || 0,
      subtotal15: parseFloat(form.value.subtotal15) || 0,
      isv15: isv15.value,
      subtotal18: parseFloat(form.value.subtotal18) || 0,
      isv18: isv18.value,
      gastoNoDeducible: 0,
      periodId: selectedPeriodId.value,
      companyId: authStore.currentCompany?._id || '000000000000000000000001'
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
    'Exento ISV (L)': p.subtotalExento || 0,
    'Subtotal 15% (L)': p.subtotal15 || 0,
    'ISV 15% (L)': p.isv15 || 0,
    'Subtotal 18% (L)': p.subtotal18 || 0,
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
  XLSX.writeFile(wb, `Ledgerly_Compras_${periodLabel}.xlsx`)
}
</script>