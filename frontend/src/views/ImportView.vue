<template>
  <div class="min-h-screen bg-[var(--color-bg-app)]">
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      <!-- Encabezado -->
      <section class="ledgerly-soft-panel rounded-xl px-6 py-7">
        <p class="text-xs font-bold uppercase tracking-wide text-[var(--color-primary-deep)]">Importación masiva</p>
        <h2 class="mt-2 text-3xl font-bold text-[var(--color-text-main)]">Importar desde Excel</h2>
        <p class="mt-2 text-sm text-[var(--color-text-muted)]">
          Carga un archivo Excel con tus transacciones y el sistema las registra automáticamente,
          creando los períodos que sean necesarios.
        </p>
      </section>

      <!-- Paso 1: Descargar plantilla -->
      <section class="ledgerly-surface rounded-xl p-6">
        <div class="flex items-center gap-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 4v12m0 0-4-4m4 4 4-4" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-[var(--color-text-main)]">Paso 1 — Descarga la plantilla</p>
            <p class="text-sm text-[var(--color-text-muted)] mt-0.5">
              El archivo incluye los encabezados correctos y una hoja de instrucciones detallada.
            </p>
          </div>
          <button
            class="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary-deep)] text-sm font-semibold hover:bg-[var(--color-primary-soft)] transition-colors"
            :disabled="downloadingTemplate"
            @click="handleDownloadTemplate"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16V4m0 12-4-4m4 4 4-4M4 20h16" />
            </svg>
            {{ downloadingTemplate ? 'Descargando...' : 'Descargar plantilla' }}
          </button>
        </div>

        <!-- Referencia de columnas -->
        <div class="mt-5 overflow-x-auto">
          <table class="w-full text-xs border border-[var(--color-border-soft)] rounded-lg overflow-hidden">
            <thead class="bg-[var(--color-bg-surface-soft)]">
              <tr>
                <th class="text-left px-3 py-2 font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Columna</th>
                <th class="text-left px-3 py-2 font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Requerido</th>
                <th class="text-left px-3 py-2 font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Formato / Valores</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border-soft)]">
              <tr v-for="col in columns" :key="col.name" class="hover:bg-[var(--color-bg-surface-soft)]">
                <td class="px-3 py-2 font-mono font-semibold text-[var(--color-primary-deep)]">{{ col.name }}</td>
                <td class="px-3 py-2">
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                    :class="col.required ? 'bg-rose-50 text-rose-600' : 'bg-[var(--color-bg-surface-soft)] text-[var(--color-text-muted)]'"
                  >
                    {{ col.required ? 'Sí' : 'Opcional' }}
                  </span>
                </td>
                <td class="px-3 py-2 text-[var(--color-text-muted)]">{{ col.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Paso 2: Subir y procesar -->
      <section class="ledgerly-surface rounded-xl p-6">
        <div class="flex items-center gap-3 mb-5">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-[var(--color-text-main)]">Paso 2 — Sube tu archivo</p>
            <p class="text-sm text-[var(--color-text-muted)] mt-0.5">Formatos aceptados: .xlsx, .xls, .csv — máximo 5 MB</p>
          </div>
        </div>

        <!-- Zona de arrastre -->
        <div
          class="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
          :class="[
            isDragging  ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' :
            selectedFile ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' :
                          'border-[var(--color-border)] bg-[var(--color-bg-surface-soft)] hover:border-[var(--color-primary)] hover:bg-white'
          ]"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="onDrop"
          @click="$refs.fileInput.click()"
        >
          <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="onFileSelect" />

          <!-- Sin archivo seleccionado -->
          <div v-if="!selectedFile">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
            </div>
            <p class="font-medium text-[var(--color-text-main)]">
              Arrastra tu archivo aquí o
              <span class="text-[var(--color-primary-deep)]">haz clic para seleccionar</span>
            </p>
            <p class="text-sm text-[var(--color-text-muted)] mt-1">Un solo archivo por importación</p>
          </div>

          <!-- Archivo seleccionado -->
          <div v-else class="flex items-center gap-3 max-w-sm mx-auto bg-white rounded-lg border border-[var(--color-border-soft)] px-4 py-3 shadow-sm" @click.stop>
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M7 4h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
              </svg>
            </span>
            <div class="flex-1 min-w-0 text-left">
              <p class="text-sm font-medium text-[var(--color-text-main)] truncate">{{ selectedFile.name }}</p>
              <p class="text-xs text-[var(--color-text-muted)]">{{ formatSize(selectedFile.size) }}</p>
            </div>
            <button class="text-sm font-bold text-[var(--color-danger)] hover:text-rose-700" @click.stop="clearFile">
              Quitar
            </button>
          </div>
        </div>

        <!-- Barra de progreso -->
        <div v-if="importing && uploadProgress > 0" class="mt-4">
          <div class="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
            <span>Enviando archivo...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="h-2 w-full rounded-full bg-[var(--color-bg-surface-soft)] overflow-hidden">
            <div
              class="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
            />
          </div>
        </div>

        <!-- Botón importar -->
        <div class="mt-5 flex justify-end">
          <button
            :disabled="!selectedFile || importing || !authStore.companyId"
            class="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleImport"
          >
            <svg v-if="!importing" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l5 5L20 7" />
            </svg>
            <svg v-else class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 0 1 8-8v4l3-3-3-3v4a8 8 0 1 0 8 8" />
            </svg>
            {{ importing ? 'Procesando...' : 'Importar transacciones' }}
          </button>
        </div>

        <p v-if="!authStore.companyId" class="text-xs text-[var(--color-danger)] mt-2 text-right">
          No hay empresa vinculada a tu cuenta. Contacta al administrador.
        </p>
      </section>

      <!-- Resultados -->
      <section v-if="result" class="ledgerly-surface rounded-xl p-6 space-y-5">
        <h3 class="font-semibold text-[var(--color-text-main)]">Resultado de la importación</h3>

        <!-- Resumen -->
        <div class="grid grid-cols-3 gap-4">
          <div class="rounded-xl p-4 bg-[var(--color-bg-surface-soft)] text-center">
            <p class="text-2xl font-bold text-[var(--color-text-main)]">{{ result.data.total }}</p>
            <p class="text-xs font-semibold text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">Total filas</p>
          </div>
          <div class="rounded-xl p-4 text-center" :class="result.data.created > 0 ? 'bg-emerald-50' : 'bg-[var(--color-bg-surface-soft)]'">
            <p class="text-2xl font-bold" :class="result.data.created > 0 ? 'text-emerald-600' : 'text-[var(--color-text-main)]'">
              {{ result.data.created }}
            </p>
            <p class="text-xs font-semibold mt-1 uppercase tracking-wide" :class="result.data.created > 0 ? 'text-emerald-500' : 'text-[var(--color-text-muted)]'">
              Creadas
            </p>
          </div>
          <div class="rounded-xl p-4 text-center" :class="result.data.errors.length > 0 ? 'bg-rose-50' : 'bg-[var(--color-bg-surface-soft)]'">
            <p class="text-2xl font-bold" :class="result.data.errors.length > 0 ? 'text-rose-600' : 'text-[var(--color-text-main)]'">
              {{ result.data.errors.length }}
            </p>
            <p class="text-xs font-semibold mt-1 uppercase tracking-wide" :class="result.data.errors.length > 0 ? 'text-rose-500' : 'text-[var(--color-text-muted)]'">
              Errores
            </p>
          </div>
        </div>

        <!-- Mensaje general -->
        <div
          class="flex items-center gap-3 rounded-xl px-4 py-3"
          :class="result.data.errors.length === 0 ? 'bg-emerald-50 text-emerald-700' : result.data.created > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="result.data.errors.length === 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138Z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
          <p class="text-sm font-medium">{{ result.message }}</p>
        </div>

        <!-- Tabla de errores -->
        <div v-if="result.data.errors.length > 0">
          <p class="text-sm font-semibold text-[var(--color-text-main)] mb-2">Filas con error</p>
          <div class="overflow-x-auto rounded-lg border border-rose-100">
            <table class="w-full text-sm">
              <thead class="bg-rose-50">
                <tr>
                  <th class="text-left px-4 py-2 text-xs font-bold text-rose-500 uppercase tracking-wide w-20">Fila</th>
                  <th class="text-left px-4 py-2 text-xs font-bold text-rose-500 uppercase tracking-wide">Motivo del error</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-rose-50">
                <tr v-for="err in result.data.errors" :key="err.fila" class="hover:bg-rose-50/50">
                  <td class="px-4 py-2.5 font-mono font-semibold text-rose-600">{{ err.fila }}</td>
                  <td class="px-4 py-2.5 text-[var(--color-text-muted)]">{{ err.error }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Botón nueva importación -->
        <div class="flex justify-end">
          <button
            class="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg text-[var(--color-text-main)] hover:bg-[var(--color-bg-surface-soft)] transition-colors"
            @click="resetImport"
          >
            Nueva importación
          </button>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { importsApi } from '@/api/imports.js'

const authStore = useAuthStore()

// ── Estado ────────────────────────────────────────────────────────────────────
const selectedFile      = ref(null)
const isDragging        = ref(false)
const importing         = ref(false)
const uploadProgress    = ref(0)
const result            = ref(null)
const downloadingTemplate = ref(false)

// ── Referencia de columnas para la tabla ─────────────────────────────────────
const columns = [
  { name: 'fecha',       required: true,  desc: 'DD/MM/YYYY o YYYY-MM-DD — ej. 01/06/2025' },
  { name: 'descripcion', required: true,  desc: 'Texto descriptivo de la transacción' },
  { name: 'monto',       required: true,  desc: 'Número positivo con punto decimal — ej. 1250.50' },
  { name: 'tipo',        required: true,  desc: 'ingreso  o  egreso  (en minúsculas)' },
  { name: 'accountCode', required: false, desc: 'Código de cuenta contable. Requerido solo para ingresos' },
]

// ── Selección de archivo ──────────────────────────────────────────────────────
const onFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) selectedFile.value = file
  e.target.value = ''
}

const onDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && /\.(xlsx|xls|csv)$/i.test(file.name)) selectedFile.value = file
}

const clearFile = () => { selectedFile.value = null; result.value = null }

const formatSize = (bytes) => {
  if (bytes < 1024)    return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

// ── Descargar plantilla ───────────────────────────────────────────────────────
const handleDownloadTemplate = async () => {
  downloadingTemplate.value = true
  try {
    const { data } = await importsApi.downloadTemplate()
    const url  = URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href     = url
    link.download = 'plantilla-importacion-ledgerly.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    alert('Error al descargar la plantilla. Verifica tu conexión.')
  } finally {
    downloadingTemplate.value = false
  }
}

// ── Importar Excel ────────────────────────────────────────────────────────────
const handleImport = async () => {
  if (!selectedFile.value || !authStore.companyId) return

  importing.value   = true
  uploadProgress.value = 0
  result.value      = null

  try {
    const { data } = await importsApi.importExcel(
      authStore.companyId,
      selectedFile.value,
      (e) => { uploadProgress.value = Math.round((e.loaded / e.total) * 100) }
    )
    result.value = data
  } catch (err) {
    result.value = {
      message: err.response?.data?.message || 'Error al procesar el archivo',
      data: { total: 0, created: 0, errors: [] }
    }
  } finally {
    importing.value = false
  }
}

// ── Resetear para nueva importación ──────────────────────────────────────────
const resetImport = () => {
  selectedFile.value   = null
  result.value         = null
  uploadProgress.value = 0
}
</script>
