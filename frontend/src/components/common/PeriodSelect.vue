<template>
  <label class="period-select">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" /></svg>
    <select :value="modelValue" @change="handleChange">
      <option value="">Seleccionar periodo</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <svg class="chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" /></svg>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'change'])

function handleChange(event) {
  emit('update:modelValue', event.target.value)
  emit('change', event)
}
</script>

<style scoped>
.period-select { display: inline-flex; align-items: center; gap: 8px; width: 100%; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 9px; background: #fff; color: var(--color-text-muted); box-shadow: 0 1px 2px rgba(15, 23, 42, .04); }
.period-select:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-soft); }
.period-select svg { width: 16px; height: 16px; flex-shrink: 0; color: var(--color-text-soft); }
.period-select .chevron { width: 14px; height: 14px; }
select { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--color-text-main); font: inherit; cursor: pointer; }
</style>
