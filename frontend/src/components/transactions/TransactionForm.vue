<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="border-b border-gray-200">
      <div class="max-w-2xl mx-auto px-8 py-6">
        <h1 class="text-2xl font-light text-gray-900">Transacciones</h1>
        <p class="text-sm text-gray-500 mt-1">Gestiona compras y ventas de tu negocio</p>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-8 py-12">
      
      <!-- Selector de Período -->
      <div class="mb-12">
        <label class="block text-xs uppercase tracking-widest text-gray-600 mb-3 font-medium">Período</label>
        <div class="flex items-center gap-3">
          <select
            v-model="selectedPeriodId"
            @change="onPeriodChange"
            class="flex-1 bg-white border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          >
            <option value="">Seleccionar período...</option>
            <option v-for="period in periods" :key="period._id" :value="period._id">
              {{ monthName(period.month) }} {{ period.year }}
            </option>
          </select>
          <button
            @click="showNewPeriodModal = true"
            class="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-md text-sm font-medium transition"
          >
            Nuevo Período
          </button>
        </div>
      </div>

      <!-- Formulario Centrado -->
      <div class="border border-gray-200 rounded-lg p-8">
        <h2 class="text-lg font-light text-gray-900 mb-8 pb-6 border-b border-gray-200">Registrar Compra</h2>

        <!-- Mensajes -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {{ error }}
        </div>
        <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          {{ success }}
        </div>

        <form @submit.prevent="savePurchase" class="space-y-6">
          
          <!-- Fecha Documento -->
          <div>
            <label class="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-medium">Fecha Documento *</label>
            <input
              v-model="form.fechaDocumento"
              type="date"
              required
              class="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          <!-- Fecha Contabilización -->
          <div>
            <label class="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-medium">Fecha Contabilización *</label>
            <input
              v-model="form.fechaContabilizacion"
              type="date"
              required
              class="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          <!-- CAI -->
          <div>
            <label class="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-medium">CAI</label>
            <input
              v-model="form.CAI"
              type="text"
              class="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          <!-- No. Factura -->
          <div>
            <label class="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-medium">No. Factura *</label>
            <input
              v-model="form.numeroFactura"
              type="text"
              placeholder="000000000000"
              required
              class="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          <hr class="border-gray-200 my-6" />

          <!-- Proveedor -->
          <div>
            <label class="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-medium">Proveedor *</label>
            <input
              v-model="form.proveedor"
              type="text"
              required
              class="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          <!-- RTN Proveedor -->
          <div>
            <label class="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-medium">RTN Proveedor *</label>
            <input
              v-model="form.rtnProveedor"
              type="text"
              placeholder="XXXXXXXXXXXX"
              required
              class="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-medium">Descripción *</label>
            <textarea
              v-model="form.descripcion"
              rows="3"
              required
              class="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
            ></textarea>
          </div>

          <hr class="border-gray-200 my-6" />

          <!-- Montos -->
          <div>
            <p class="text-xs uppercase tracking-widest text-gray-600 mb-4 font-medium">Exento de ISV</p>
            <input
              v-model="form.subtotalExento"
              type="number"
              step="0.01"
              min="0"
              @input="calculateTotals"
              class="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          <div>
            <p class="text-xs uppercase tracking-widest text-gray-600 mb-4 font-medium">Gravado al 15%</p>
            <div class="grid grid-cols-2 gap-3">
              <input
                v-model="form.subtotal15"
                type="number"
                step="0.01"
                min="0"
                @input="calculateISV15"
                placeholder="Subtotal"
                class="border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
              <input
                v-model="form.isv15"
                type="number"
                step="0.01"
                disabled
                placeholder="ISV (auto)"
                class="border border-gray-300 rounded-md px-4 py-3 text-gray-500 bg-gray-50"
              />
            </div>
          </div>

          <div>
            <p class="text-xs uppercase tracking-widest text-gray-600 mb-4 font-medium">Gravado al 18%</p>
            <div class="grid grid-cols-2 gap-3">
              <input
                v-model="form.subtotal18"
                type="number"
                step="0.01"
                min="0"
                @input="calculateISV18"
                placeholder="Subtotal"
                class="border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
              <input
                v-model="form.isv18"
                type="number"
                step="0.01"
                disabled
                placeholder="ISV (auto)"
                class="border border-gray-300 rounded-md px-4 py-3 text-gray-500 bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-medium">Gasto No Deducible</label>
            <input
              v-model="form.gastoNoDeducible"
              type="number"
              step="0.01"
              min="0"
              class="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>

          <hr class="border-gray-200 my-6" />

          <!-- Resumen Fiscal -->
          <div class="bg-gray-50 rounded-md p-6 border border-gray-200">
            <h3 class="text-xs uppercase tracking-widest text-gray-600 font-medium mb-4">Resumen Fiscal</h3>
            
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-xs text-gray-500 mb-1">Total Bruto</p>
                <p class="text-3xl font-light text-gray-900">{{ formatCurrency(totalBruto) }}</p>
              </div>
              
              <div>
                <p class="text-xs text-gray-500 mb-1">Crédito Fiscal</p>
                <p class="text-3xl font-light text-gray-900">{{ formatCurrency(creditoFiscal) }}</p>
              </div>
            </div>

            <hr class="border-gray-200 my-4" />

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-1">Subtotal 15%</p>
                <p class="text-gray-900">{{ parseFloat(form.subtotal15 || 0).toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">ISV 15%</p>
                <p class="text-gray-900">{{ parseFloat(form.isv15 || 0).toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Subtotal 18%</p>
                <p class="text-gray-900">{{ parseFloat(form.subtotal18 || 0).toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">ISV 18%</p>
                <p class="text-gray-900">{{ parseFloat(form.isv18 || 0).toFixed(2) }}</p>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-3 rounded-md font-medium transition text-sm"
            >
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
            <button
              type="reset"
              @click="resetForm"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-md font-medium transition text-sm"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const API = 'http://localhost:4000/api'

const selectedPeriodId = ref('')
const periods = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  fechaDocumento: '',
  fechaContabilizacion: '',
  CAI: '',
  numeroFactura: '',
  proveedor: '',
  rtnProveedor: '',
  descripcion: '',
  subtotalExento: 0,
  subtotal15: 0,
  isv15: 0,
  subtotal18: 0,
  isv18: 0,
  gastoNoDeducible: 0
})

const totalBruto = computed(() => {
  return (parseFloat(form.value.subtotalExento) || 0) +
         (parseFloat(form.value.subtotal15) || 0) +
         (parseFloat(form.value.isv15) || 0) +
         (parseFloat(form.value.subtotal18) || 0) +
         (parseFloat(form.value.isv18) || 0)
})

const creditoFiscal = computed(() => {
  return (parseFloat(form.value.isv15) || 0) +
         (parseFloat(form.value.isv18) || 0)
})

onMounted(async () => {
  await loadPeriods()
})

async function loadPeriods() {
  try {
    const response = await fetch(`${API}/periods`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      const data = await response.json()
      periods.value = data.data || []
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

async function onPeriodChange() {
  // Cargar algo si lo necesitas
}

function calculateISV15() {
  const subtotal = parseFloat(form.value.subtotal15) || 0
  form.value.isv15 = Math.round(subtotal * 0.15 * 100) / 100
}

function calculateISV18() {
  const subtotal = parseFloat(form.value.subtotal18) || 0
  form.value.isv18 = Math.round(subtotal * 0.18 * 100) / 100
}

function calculateTotals() {
  calculateISV15()
  calculateISV18()
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2
  }).format(value)
}

function monthName(month) {
  const months = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return months[month] || month
}

async function savePurchase() {
  error.value = ''
  success.value = ''

  if (!selectedPeriodId.value) {
    error.value = 'Selecciona un período'
    return
  }

  if (!form.value.fechaDocumento || !form.value.proveedor || !form.value.numeroFactura) {
    error.value = 'Completa los campos requeridos'
    return
  }

  const totalSubtotales = (parseFloat(form.value.subtotalExento) || 0) +
                          (parseFloat(form.value.subtotal15) || 0) +
                          (parseFloat(form.value.subtotal18) || 0)

  if (totalSubtotales <= 0) {
    error.value = 'Debe ingresar al menos un subtotal'
    return
  }

  loading.value = true
  try {
    const response = await fetch(`${API}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        ...form.value,
        periodId: selectedPeriodId.value
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Error al guardar')
    }

    success.value = 'Compra guardada exitosamente'
    resetForm()
  } catch (err) {
    error.value = err.message || 'Error al guardar la compra'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    fechaDocumento: '',
    fechaContabilizacion: '',
    CAI: '',
    numeroFactura: '',
    proveedor: '',
    rtnProveedor: '',
    descripcion: '',
    subtotalExento: 0,
    subtotal15: 0,
    isv15: 0,
    subtotal18: 0,
    isv18: 0,
    gastoNoDeducible: 0
  }
}
</script>