<template>
  <div class="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium" :class="toneClass">
    <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath" />
    </svg>
    <span><slot /></span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: { type: String, default: 'info' }
})

const toneClass = computed(() => ({
  info: 'bg-[var(--color-primary-soft)] border-blue-200 text-[var(--color-primary-deep)]',
  success: 'bg-[var(--color-success-soft)] border-emerald-200 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-soft)] border-amber-200 text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-soft)] border-rose-200 text-[var(--color-danger)]'
}[props.tone] || 'bg-[var(--color-primary-soft)] border-blue-200 text-[var(--color-primary-deep)]'))

const iconPath = computed(() => ({
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  danger: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
}[props.tone] || ''))
</script>
