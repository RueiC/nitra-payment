<script setup lang="ts">
const emit = defineEmits(['close']);

function closeBaseModal(): void {
  emit('close');
}
</script>

<template>
  <div class="base-modal__backdrop">
    <section class="base-modal__container" role="dialog" aria-modal="true">
      <header class="base-modal__header">
        <slot name="header" :close="closeBaseModal"></slot>
      </header>

      <div class="base-modal__body">
        <slot name="body"></slot>
      </div>

      <footer class="base-modal__footer">
        <slot name="footer" :close="closeBaseModal"></slot>
      </footer>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.base-modal {
  &__backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--q-color-black-50, rgba(0, 0, 0, 0.5));
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__container {
    background-color: var(--q-color-white, white);
    padding: 20px;
    border-radius: 8px;
    width: 100%;
    max-width: 560px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
