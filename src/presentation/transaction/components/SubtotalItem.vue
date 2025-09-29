<script setup lang="ts">
defineProps<{
  label?: string;
  value?: string;
  size?: 'sm' | 'md';
}>();
</script>

<template>
  <div
    class="subtotal-item"
    :class="size ? `subtotal-item--${size}` : 'subtotal-item--sm'"
    role="group"
  >
    <slot name="label">
      <span v-if="label" class="subtotal-item__label">{{ label }}</span>
    </slot>

    <slot name="value">
      <span v-if="value" class="subtotal-item__value">{{ value }}</span>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.subtotal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  &--sm {
    padding: 12px 16px 9px 16px;
  }

  &--md {
    padding: 24px 16px;
  }

  &__label,
  &__value {
    font-weight: 500;
    font-size: map.get($font-size, 'xs');
    line-height: 100%;
    letter-spacing: 0.5%;
  }
}
</style>
