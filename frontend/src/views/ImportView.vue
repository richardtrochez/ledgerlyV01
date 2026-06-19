<template>
  <div class="min-h-screen bg-[var(--color-bg-app)]">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section class="ledgerly-soft-panel mb-8 rounded-xl px-6 py-7">
        <p class="text-xs font-bold uppercase tracking-wide text-[var(--color-primary-deep)]">Carga de archivos</p>
        <h2 class="mt-2 text-3xl font-bold text-[var(--color-text-main)]">Importar datos desde Excel</h2>
        <p class="mt-2 text-sm text-[var(--color-text-muted)]">
          Sube archivos Excel o CSV para dejarlos listos en la cola de procesamiento del sistema.
        </p>
      </section>

      <section class="ledgerly-surface rounded-xl p-6 mb-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 class="text-lg font-semibold text-[var(--color-text-main)]">Seleccionar archivos</h3>
            <p class="text-sm text-[var(--color-text-muted)] mt-1">Formatos aceptados: .xlsx, .xls y .csv.</p>
          </div>
          <span class="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-deep)]">Max. 10 MB</span>
        </div>

        <div
          class="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
          :class="isDragging
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
            : selectedFiles.length > 0
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
              : 'border-[var(--color-border)] bg-[var(--color-bg-surface-soft)] hover:border-[var(--color-primary)] hover:bg-white'"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="onDrop"
          @click="$refs.fileInput.click()"
        >
          <input ref="fileInput" type="file" multiple accept=".xlsx,.xls,.csv" class="hidden" @change="onFileSelect" />

          <div v-if="selectedFiles.length === 0">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
            </div>
            <p class="font-medium text-[var(--color-text-main)]">Arrastra tus archivos aqui o <span class="text-[var(--color-primary-deep)]">haz clic para seleccionar</span></p>
            <p class="text-sm text-[var(--color-text-muted)] mt-1">Puedes cargar uno o varios archivos.</p>
          </div>

          <div v-else class="text-left space-y-2">
            <div
              v-for="(file, i) in selectedFiles"
              :key="i"
              class="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-[var(--color-border-soft)] shadow-sm"
              @click.stop
            >
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M7 4h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                </svg>
              </span>
              <span class="flex-1 text-sm font-medium text-[var(--color-text-main)] truncate">{{ file.name }}</span>
              <span class="text-xs text-[var(--color-text-muted)]">{{ formatSize(file.size) }}</span>
              <button class="text-sm font-bold ml-2 text-[var(--color-danger)] hover:text-rose-700" @click.stop="removeFile(i)">Quitar</button>
            </div>
            <p class="text-sm text-[var(--color-primary-deep)] mt-2 cursor-pointer font-medium" @click.stop="$refs.fileInput.click()">Agregar mas archivos</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-end gap-4 mt-5">
          <div>
            <label class="block text-sm font-semibold text-[var(--color-text-main)] mb-1">Empresa</label>
            <select v-model="companyId" class="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
              <option value="test1">Empresa Demo</option>
            </select>
          </div>
          <button
            :disabled="selectedFiles.length === 0 || uploading"
            class="sm:ml-auto px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="uploadFiles"
          >
            {{ uploading ? 'Subiendo...' : 'Subir archivos' }}
          </button>
        </div>
      </section>

      <section
        v-if="uploadResult"
        class="rounded-xl p-5 mb-6 border"
        :class="uploadResult.success ? 'bg-[var(--color-primary-soft)] border-blue-200 text-[var(--color-primary-deep)]' : 'bg-[var(--color-danger-soft)] border-rose-200 text-[var(--color-danger)]'"
      >
        <p class="font-semibold text-base">{{ uploadResult.success ? 'Carga completada' : 'Error de carga' }}</p>
        <p class="text-sm mt-1">{{ uploadResult.message }}</p>
      </section>

      <section class="ledgerly-surface rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-[var(--color-text-main)]">Archivos en cola</h3>
            <p class="text-sm text-[var(--color-text-muted)] mt-1">Estos archivos quedan listos para ser procesados.</p>
          </div>
          <button class="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg text-[var(--color-text-main)] hover:bg-[var(--color-bg-surface-soft)] transition-colors" @click="loadPending">
            Actualizar
          </button>
        </div>

        <div v-if="pendingFiles.length === 0" class="text-center py-8 text-[var(--color-text-muted)]">
          <p class="text-sm">No hay archivos pendientes de procesar</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--color-border-soft)]">
              <th class="text-left py-2 px-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Archivo</th>
              <th class="text-left py-2 px-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Tamano</th>
              <th class="text-left py-2 px-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Subido</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in pendingFiles" :key="f.name" class="border-b border-[var(--color-border-soft)] hover:bg-[var(--color-bg-surface-soft)]">
              <td class="py-3 px-3 font-medium text-[var(--color-text-main)]">{{ f.name.substring(14) }}</td>
              <td class="py-3 px-3 text-[var(--color-text-muted)]">{{ formatSize(f.size) }}</td>
              <td class="py-3 px-3 text-[var(--color-text-muted)]">{{ f.uploaded }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const companyId = ref('test1')
const selectedFiles = ref([])
const isDragging = ref(false)
const uploading = ref(false)
const uploadResult = ref(null)
const pendingFiles = ref([])

const onFileSelect = (e) => { addFiles(Array.from(e.target.files)); e.target.value = '' }
const onDrop = (e) => { isDragging.value = false; addFiles(Array.from(e.dataTransfer.files)) }
const addFiles = (files) => {
  selectedFiles.value.push(...files.filter(f => /\.(xlsx|xls|csv)$/i.test(f.name)))
}
const removeFile = (i) => selectedFiles.value.splice(i, 1)
const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const uploadFiles = async () => {
  if (!selectedFiles.value.length) return
  uploading.value = true
  uploadResult.value = null
  try {
    const form = new FormData()
    selectedFiles.value.forEach(f => form.append('files', f))
    const { data } = await axios.post(`${API}/uploads/${companyId.value}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    uploadResult.value = data
    selectedFiles.value = []
    await loadPending()
  } catch (err) {
    uploadResult.value = { success: false, message: err.response?.data?.message || 'Error al subir los archivos' }
  } finally {
    uploading.value = false
  }
}

const loadPending = async () => {
  try {
    const { data } = await axios.get(`${API}/uploads/${companyId.value}/pending`)
    pendingFiles.value = data.files || []
  } catch {
    pendingFiles.value = []
  }
}

onMounted(loadPending)
</script>
