<template>
  <div class="min-h-screen bg-[var(--color-bg-app)]">
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <section class="ledgerly-soft-panel rounded-xl px-6 py-7">
        <p class="text-xs font-bold uppercase tracking-wide text-[var(--color-primary-deep)]">Importacion masiva</p>
        <h2 class="mt-2 text-3xl font-bold text-[var(--color-text-main)]">Importar desde Excel</h2>
        <p class="mt-2 text-sm text-[var(--color-text-muted)]">
          Carga un archivo Excel con tus transacciones. El sistema valida filas, crea periodos si hacen falta
          y registra los movimientos para la empresa del usuario autenticado.
        </p>
      </section>

      <section class="ledgerly-surface rounded-xl p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-semibold text-[var(--color-text-main)]">Paso 1: Descarga la plantilla</p>
            <p class="text-sm text-[var(--color-text-muted)] mt-1">
              Incluye encabezados, ejemplos e instrucciones para preparar el archivo.
            </p>
          </div>
          <button
            class="px-4 py-2 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary-deep)] text-sm font-semibold hover:bg-[var(--color-primary-soft)] disabled:opacity-50"
            :disabled="downloadingTemplate"
            @click="handleDownloadTemplate"
          >
            {{ downloadingTemplate ? 'Descargando...' : 'Descargar plantilla' }}
          </button>
        </div>

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
              <tr v-for="column in columns" :key="column.name">
                <td class="px-3 py-2 font-mono font-semibold text-[var(--color-primary-deep)]">{{ column.name }}</td>
                <td class="px-3 py-2">{{ column.required ? 'Si' : 'Opcional' }}</td>
                <td class="px-3 py-2 text-[var(--color-text-muted)]">{{ column.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="ledgerly-surface rounded-xl p-6">
        <div class="mb-5">
          <p class="font-semibold text-[var(--color-text-main)]">Paso 2: Sube tu archivo</p>
          <p class="text-sm text-[var(--color-text-muted)] mt-1">Formatos aceptados: .xlsx, .xls, .csv. Maximo 5 MB.</p>
        </div>

        <div
          class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
          :class="selectedFile ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' : 'border-[var(--color-border)] bg-[var(--color-bg-surface-soft)] hover:border-[var(--color-primary)]'"
          @dragover.prevent
          @drop.prevent="onDrop"
          @click="$refs.fileInput.click()"
        >
          <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="onFileSelect" />

          <div v-if="!selectedFile">
            <p class="font-medium text-[var(--color-text-main)]">Arrastra tu archivo aqui o haz clic para seleccionar</p>
            <p class="text-sm text-[var(--color-text-muted)] mt-1">Un solo archivo por importacion</p>
          </div>

          <div v-else class="max-w-md mx-auto bg-white rounded-lg border border-[var(--color-border-soft)] px-4 py-3 shadow-sm" @click.stop>
            <p class="text-sm font-medium text-[var(--color-text-main)] truncate">{{ selectedFile.name }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-1">{{ formatSize(selectedFile.size) }}</p>
            <button class="mt-3 text-sm font-bold text-[var(--color-danger)] hover:text-rose-700" @click.stop="clearFile">
              Quitar
            </button>
          </div>
        </div>

        <div v-if="importing && uploadProgress > 0" class="mt-4">
          <div class="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
            <span>Enviando archivo...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="h-2 w-full rounded-full bg-[var(--color-bg-surface-soft)] overflow-hidden">
            <div class="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300" :style="{ width: uploadProgress + '%' }" />
          </div>
        </div>

        <div class="mt-5 flex justify-end">
          <button
            :disabled="!selectedFile || importing"
            class="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleImport"
          >
            {{ importing ? 'Procesando...' : 'Importar transacciones' }}
          </button>
        </div>
      </section>

      <section v-if="result" class="ledgerly-surface rounded-xl p-6 space-y-5">
        <h3 class="font-semibold text-[var(--color-text-main)]">Resultado de la importacion</h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="rounded-xl p-4 bg-[var(--color-bg-surface-soft)] text-center">
            <p class="text-2xl font-bold text-[var(--color-text-main)]">{{ result.data.total }}</p>
            <p class="text-xs font-semibold text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">Total filas</p>
          </div>
          <div class="rounded-xl p-4 bg-emerald-50 text-center">
            <p class="text-2xl font-bold text-emerald-600">{{ result.data.created }}</p>
            <p class="text-xs font-semibold text-emerald-500 mt-1 uppercase tracking-wide">Creadas</p>
          </div>
          <div class="rounded-xl p-4 bg-rose-50 text-center">
            <p class="text-2xl font-bold text-rose-600">{{ result.data.errors.length }}</p>
            <p class="text-xs font-semibold text-rose-500 mt-1 uppercase tracking-wide">Errores</p>
          </div>
        </div>

        <div class="rounded-xl px-4 py-3 bg-[var(--color-bg-surface-soft)]">
          <p class="text-sm font-medium text-[var(--color-text-main)]">{{ result.message }}</p>
        </div>

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
                <tr v-for="err in result.data.errors" :key="`${err.fila}-${err.error}`">
                  <td class="px-4 py-2.5 font-mono font-semibold text-rose-600">{{ err.fila }}</td>
                  <td class="px-4 py-2.5 text-[var(--color-text-muted)]">{{ err.error }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            class="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg text-[var(--color-text-main)] hover:bg-[var(--color-bg-surface-soft)]"
            @click="resetImport"
          >
            Nueva importacion
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { importsApi } from '@/api/imports.js'

const selectedFile = ref(null)
const importing = ref(false)
const uploadProgress = ref(0)
const result = ref(null)
const downloadingTemplate = ref(false)

const columns = [
  { name: 'fecha', required: true, desc: 'DD/MM/YYYY o YYYY-MM-DD. Ejemplo: 01/06/2025' },
  { name: 'descripcion', required: true, desc: 'Texto descriptivo de la transaccion' },
  { name: 'monto', required: true, desc: 'Numero positivo con punto decimal. Ejemplo: 1250.50' },
  { name: 'tipo', required: true, desc: 'ingreso o egreso' },
  { name: 'accountCode', required: false, desc: 'Codigo de cuenta contable. Requerido solo para ingresos' }
]

function onFileSelect(event) {
  const file = event.target.files[0]
  if (file) selectedFile.value = file
  event.target.value = ''
}

function onDrop(event) {
  const file = event.dataTransfer.files[0]
  if (file && /\.(xlsx|xls|csv)$/i.test(file.name)) {
    selectedFile.value = file
  }
}

function clearFile() {
  selectedFile.value = null
  result.value = null
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

async function handleDownloadTemplate() {
  downloadingTemplate.value = true
  try {
    const { data } = await importsApi.downloadTemplate()
    const url = URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'plantilla-importacion-ledgerly.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    alert('Error al descargar la plantilla. Verifica tu conexion.')
  } finally {
    downloadingTemplate.value = false
  }
}

async function handleImport() {
  if (!selectedFile.value) return

  importing.value = true
  uploadProgress.value = 0
  result.value = null

  try {
    const { data } = await importsApi.importExcel(
      selectedFile.value,
      (event) => {
        if (event.total) {
          uploadProgress.value = Math.round((event.loaded / event.total) * 100)
        }
      }
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

function resetImport() {
  selectedFile.value = null
  result.value = null
  uploadProgress.value = 0
}
</script>
