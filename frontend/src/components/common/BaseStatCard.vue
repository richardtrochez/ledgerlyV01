<template>
  <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5 min-h-[128px]">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">{{ label }}</p>
        <p class="mt-1 text-2xl font-bold tabular-nums" :class="toneClass">{{ value }}</p>
        <p v-if="sub" class="mt-1 text-xs text-[var(--color-text-muted)]">{{ sub }}</p>
        <p v-if="delta !== null" class="mt-1 text-xs font-semibold tabular-nums" :class="deltaClass">
          {{ deltaLabel }}
        </p>
      </div>
      <div v-if="$slots.icon" class="shrink-0 p-2 rounded-lg bg-slate-50" :class="toneClass">
        <slot name="icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  sub: { type: String, default: '' },
  tone: { type: String, default: 'default' },
  delta: { type: Number, default: null }
})

const toneClass = computed(() => ({
  default: 'text-slate-900',
  income: 'text-[var(--color-success)]',
  expense: 'text-[var(--color-danger)]',
  profit: 'text-[var(--color-primary-deep)]',
  warning: 'text-slate-700'
}[props.tone] || 'text-gray-900'))

const deltaClass = computed(() => props.delta >= 0
  ? 'text-[var(--color-success)]'
  : 'text-[var(--color-danger)]'
)

const deltaLabel = computed(() => {
  const arrow = props.delta >= 0 ? '▲' : '▼'
  return `${arrow} ${Math.abs(props.delta).toFixed(1)}% vs periodo anterior`
})
</script>
