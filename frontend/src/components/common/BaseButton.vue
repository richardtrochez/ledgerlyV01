<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- Icon (slot) -->
    <slot name="icon"></slot>

    <!-- Text -->
    <span>
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, success, danger, warning, ghost
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'ghost', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  // Size classes
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  // Variant classes
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100',
    success: 'bg-success text-white hover:bg-success-dark focus:ring-success disabled:bg-success/50',
    danger: 'bg-danger text-white hover:bg-danger-dark focus:ring-danger disabled:bg-danger/50',
    warning: 'bg-warning text-white hover:bg-warning-dark focus:ring-warning disabled:bg-warning/50',
    ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500'
  }

  const blockClass = props.block ? 'w-full' : ''
  const disabledClass = (props.disabled || props.loading) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'

  return `${base} ${sizes[props.size]} ${variants[props.variant]} ${blockClass} ${disabledClass}`
})

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
