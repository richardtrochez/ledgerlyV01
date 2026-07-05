<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
      <!-- Header -->
      <div class="border-b border-slate-200 px-6 py-4">
        <h2 class="text-lg font-semibold text-slate-900">Nuevo Período</h2>
      </div>

      <!-- Body -->
      <div class="px-6 py-6">
        <!-- Mensajes -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <!-- Formulario -->
        <form @submit.prevent="savePeriod" class="space-y-4">
          <!-- Mes -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-tight">Mes *</label>
            <select
              v-model="form.month"
              required
              class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar mes...</option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>

          <!-- Año -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-tight">Año *</label>
            <input
              v-model="form.year"
              type="number"
              :min="currentYear"
              required
              class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition"
            >
              {{ loading ? 'Creando...' : 'Crear Período' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-lg font-semibold text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'created'])

const authStore = useAuthStore()
const API = 'http://localhost:4000/api'

const currentYear = new Date().getFullYear()
const loading = ref(false)
const error = ref('')

const form = ref({
  month: '',
  year: currentYear
})

async function savePeriod() {
  error.value = ''

  if (!form.value.month || !form.value.year) {
    error.value = 'Completa todos los campos'
    return
  }

  loading.value = true
  try {
    const response = await fetch(`${API}/periods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        month: parseInt(form.value.month),
        year: parseInt(form.value.year)
      })

    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Error al crear período')
    }

    const data = await response.json()
    emit('created', data.data)
    closeModal()
  } catch (err) {
    error.value = err.message || 'Error al crear período'
  } finally {
    loading.value = false
  }
}

function closeModal() {
  form.value = {
    month: '',
    year: currentYear
  }
  error.value = ''
  emit('close')
}
</script>

<style scoped>
/* Animación suave al aparecer */
div {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
