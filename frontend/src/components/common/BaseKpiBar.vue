<template>
  <div class="bg-white rounded-lg shadow-[var(--shadow-card)] ring-1 ring-[var(--color-border-soft)] p-5">
    <div class="flex justify-between items-center mb-3">
      <p class="text-sm font-semibold text-[var(--color-text-main)]">{{ label }}</p>
      <span class="text-lg font-bold tabular-nums" :class="valueClass">{{ value.toFixed(1) }}%</span>
    </div>
    <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
      <div
        class="h-3 rounded-full transition-all duration-500"
        :class="fillClass"
        :style="{ width: clamped + '%' }"
      ></div>
    </div>
    <div v-if="threshold !== null" class="flex justify-between mt-2 text-xs text-slate-400">
      <span>0%</span>
      <span class="text-slate-500">Umbral: {{ threshold }}%</span>
      <span>100%</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, default: 0 },
  threshold: { type: Number, default: null },
  goodWhen: { type: String, default: 'gte' }
})

const clamped = computed(() => Math.min(Math.max(props.value, 0), 100))
const isGood = computed(() => {
  if (props.threshold === null) return true
  return props.goodWhen === 'gte' ? props.value >= props.threshold : props.value <= props.threshold
})
const fillClass = computed(() => {
  if (props.threshold === null) return 'bg-[var(--color-primary)]'
  if (isGood.value) return 'bg-[var(--color-primary)]'
  return props.goodWhen === 'lte' ? 'bg-slate-500' : 'bg-[var(--color-danger)]'
})
const valueClass = computed(() => {
  if (props.threshold === null) return 'text-slate-900'
  if (isGood.value) return 'text-[var(--color-primary-deep)]'
  return props.goodWhen === 'lte' ? 'text-slate-700' : 'text-[var(--color-danger)]'
})
</script>
