<template>
  <div class="min-h-screen bg-[var(--color-bg-app)]">
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      <!-- Encabezado -->
      <section class="ledgerly-soft-panel rounded-xl px-6 py-7">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-wide text-[var(--color-primary-deep)]">Inteligencia Artificial</p>
            <h2 class="mt-2 text-3xl font-bold text-[var(--color-text-main)]">Análisis Financiero IA</h2>
            <p class="mt-2 text-sm text-[var(--color-text-muted)]">
              El agente lee tus datos reales y genera un diagnóstico con comparativa vs el mes anterior.
            </p>
          </div>
          <span class="shrink-0 flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <svg class="h-3 w-3 fill-current" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
            Groq · Llama 3.1
          </span>
        </div>
      </section>

      <!-- Panel de control -->
      <section class="ledgerly-surface rounded-xl p-6 space-y-4">

        <!-- Selector de modo -->
        <div class="flex rounded-lg border border-[var(--color-border)] overflow-hidden w-fit">
          <button
            class="px-4 py-2 text-sm font-semibold transition-colors"
            :class="modo === 'anual' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-soft)]'"
            @click="modo = 'anual'; resultado = null"
          >
            Análisis anual
          </button>
          <button
            class="px-4 py-2 text-sm font-semibold transition-colors border-l border-[var(--color-border)]"
            :class="modo === 'periodo' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-soft)]'"
            @click="modo = 'periodo'; resultado = null"
          >
            Período específico
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">

          <!-- Modo anual: selector de año -->
          <div v-if="modo === 'anual'">
            <label class="block text-sm font-semibold text-[var(--color-text-main)] mb-1">Año</label>
            <select v-model="yearSeleccionado" class="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
              <option v-for="y in yearsDisponibles" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <!-- Modo período: selector de año + período -->
          <template v-if="modo === 'periodo'">
            <div>
              <label class="block text-sm font-semibold text-[var(--color-text-main)] mb-1">Año</label>
              <select v-model="yearSeleccionado" class="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" @change="cargarPeriodos">
                <option v-for="y in yearsDisponibles" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[var(--color-text-main)] mb-1">Período</label>
              <select v-model="periodIdSeleccionado" class="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" :disabled="cargandoPeriodos">
                <option value="">{{ cargandoPeriodos ? 'Cargando...' : 'Selecciona un período' }}</option>
                <option v-for="p in periodos" :key="p._id" :value="p._id">
                  {{ nombreMes(p.month) }} {{ p.year }} — {{ p.status }}
                </option>
              </select>
            </div>
          </template>

          <!-- Botón analizar -->
          <button
            :disabled="cargando || (modo === 'periodo' && !periodIdSeleccionado)"
            class="sm:ml-auto flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="generarAnalisis"
          >
            <svg v-if="!cargando" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <svg v-else class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
            </svg>
            {{ cargando ? 'Analizando...' : 'Generar análisis' }}
          </button>
        </div>

        <!-- Estado cargando -->
        <div v-if="cargando" class="flex items-center gap-3 rounded-xl bg-[var(--color-primary-soft)] px-4 py-3">
          <svg class="h-5 w-5 animate-spin text-[var(--color-primary-deep)]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
          </svg>
          <div>
            <p class="text-sm font-semibold text-[var(--color-primary-deep)]">El agente está procesando tu información</p>
            <p class="text-xs text-[var(--color-primary-deep)] opacity-70 mt-0.5">Consultando base de datos y generando análisis con Groq...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3">
          <svg class="h-5 w-5 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
          </svg>
          <p class="text-sm font-medium text-rose-700">{{ error }}</p>
        </div>
      </section>

      <!-- Resultados -->
      <template v-if="resultado">

        <!-- Tarjetas numéricas -->
        <section class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div v-for="card in tarjetasResumen" :key="card.label" class="ledgerly-surface rounded-xl px-4 py-4">
            <p class="text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-muted)] mb-1">{{ card.label }}</p>
            <p class="text-lg font-bold" :class="card.color">{{ card.valor }}</p>
            <!-- Variación vs mes anterior -->
            <p v-if="card.variacion !== undefined && card.variacion !== null" class="text-xs mt-1 font-semibold" :class="card.variacion >= 0 ? 'text-emerald-600' : 'text-rose-500'">
              {{ card.variacion >= 0 ? '▲' : '▼' }} {{ Math.abs(card.variacion) }}% vs {{ resultado.resumen.comparativa?.mes || 'mes anterior' }}
            </p>
          </div>
        </section>

        <!-- Análisis de texto -->
        <section class="ledgerly-surface rounded-xl p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m1.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-[var(--color-text-main)]">Diagnóstico del agente</p>
              <p class="text-xs text-[var(--color-text-muted)]">{{ resultado.etiqueta }} · Groq / Llama 3.1</p>
            </div>
          </div>

          <!-- Secciones parseadas -->
          <div v-if="seccionesAnalisis.length > 0" class="space-y-4">
            <div v-for="sec in seccionesAnalisis" :key="sec.titulo" class="rounded-xl p-4" :class="sec.bg">
              <p class="text-xs font-bold uppercase tracking-wide mb-2" :class="sec.titleColor">{{ sec.titulo }}</p>
              <div class="text-sm text-[var(--color-text-main)] leading-relaxed whitespace-pre-line">{{ sec.contenido }}</div>
            </div>
          </div>

          <!-- Fallback texto crudo -->
          <div v-else class="text-sm text-[var(--color-text-main)] leading-relaxed whitespace-pre-line">
            {{ resultado.analisis }}
          </div>
        </section>

        <!-- Botón nuevo análisis -->
        <div class="flex justify-end">
          <button class="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg text-[var(--color-text-main)] hover:bg-[var(--color-bg-surface-soft)] transition-colors" @click="limpiar">
            Nuevo análisis
          </button>
        </div>

      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { agentApi }    from '@/api/agent.js'
import apiClient       from '@/api/axios.js'

// ── Estado ────────────────────────────────────────────────────────────────────
const yearActual          = new Date().getFullYear()
const yearsDisponibles    = Array.from({ length: 4 }, (_, i) => yearActual - i)
const yearSeleccionado    = ref(yearActual)
const periodIdSeleccionado = ref('')
const periodos            = ref([])
const cargandoPeriodos    = ref(false)
const modo                = ref('anual')  // 'anual' | 'periodo'
const cargando            = ref(false)
const error               = ref(null)
const resultado           = ref(null)

const MESES_NOMBRES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const nombreMes = (m) => MESES_NOMBRES[m - 1]
const fmt = (n) => `L ${Number(n || 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`

// ── Cargar períodos del año seleccionado ──────────────────────────────────────
const cargarPeriodos = async () => {
  cargandoPeriodos.value    = true
  periodIdSeleccionado.value = ''
  periodos.value            = []
  try {
    const { data } = await apiClient.get('/periods')
    periodos.value = (data.data || [])
      .filter(p => p.year === yearSeleccionado.value)
      .sort((a, b) => b.month - a.month)
  } catch {
    periodos.value = []
  } finally {
    cargandoPeriodos.value = false
  }
}

onMounted(() => { if (modo.value === 'periodo') cargarPeriodos() })

// ── Tarjetas de resumen ───────────────────────────────────────────────────────
const tarjetasResumen = computed(() => {
  if (!resultado.value) return []
  const r = resultado.value.resumen
  const c = r.comparativa

  return [
    { label: 'Ingresos',       valor: fmt(r.totalIngresos), color: 'text-emerald-600',                   variacion: c ? parseFloat(c.varIngresos) : undefined },
    { label: 'Egresos',        valor: fmt(r.totalEgresos),  color: 'text-rose-500',                       variacion: undefined },
    { label: 'Compras',        valor: fmt(r.totalCompras),  color: 'text-amber-600',                      variacion: c ? parseFloat(c.varCompras)  : undefined },
    { label: 'Margen bruto',   valor: fmt(r.margenBruto),   color: r.margenBruto  >= 0 ? 'text-emerald-600' : 'text-rose-500', variacion: undefined },
    { label: 'Utilidad neta',  valor: fmt(r.utilidadNeta),  color: r.utilidadNeta >= 0 ? 'text-[var(--color-primary-deep)]' : 'text-rose-500', variacion: c ? parseFloat(c.varUtilidad) : undefined },
    { label: 'Crédito fiscal', valor: fmt(r.creditoFiscal), color: 'text-[var(--color-text-main)]',       variacion: undefined },
  ]
})

// ── Parsear secciones del texto de Groq ───────────────────────────────────────
const seccionesAnalisis = computed(() => {
  if (!resultado.value?.analisis) return []
  const texto = resultado.value.analisis
  const defs  = [
    { key: 'DIAGNÓSTICO GENERAL',   titulo: '1. Diagnóstico general',   bg: 'bg-blue-50',   titleColor: 'text-blue-600' },
    { key: 'PUNTOS POSITIVOS',      titulo: '2. Puntos positivos',      bg: 'bg-emerald-50', titleColor: 'text-emerald-600' },
    { key: 'RIESGOS IDENTIFICADOS', titulo: '3. Riesgos identificados', bg: 'bg-amber-50',  titleColor: 'text-amber-600' },
    { key: 'RECOMENDACIONES',       titulo: '4. Recomendaciones',       bg: 'bg-[var(--color-primary-soft)]', titleColor: 'text-[var(--color-primary-deep)]' },
  ]
  return defs.reduce((acc, def, idx) => {
    const regex = new RegExp(`${def.key}[:\\s]*([\\s\\S]*?)(?=${defs[idx + 1]?.key}|$)`, 'i')
    const match = texto.match(regex)
    if (match) acc.push({ ...def, contenido: match[1].replace(/^\d+\.\s*/, '').trim() })
    return acc
  }, [])
})

// ── Acciones ──────────────────────────────────────────────────────────────────
const generarAnalisis = async () => {
  cargando.value  = true
  error.value     = null
  resultado.value = null
  try {
    const params = modo.value === 'periodo'
      ? { periodId: periodIdSeleccionado.value }
      : { year: yearSeleccionado.value }

    const { data } = await agentApi.analizarFinanzas(params)
    resultado.value = data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

const limpiar = () => { resultado.value = null; error.value = null }
</script>
