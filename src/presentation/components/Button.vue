<script setup lang="ts">
enum ButtonStyle {
  Primary = 'primary',
  Secondary = 'secondary',
  Borderless = 'borderless',
}

defineProps({
  text: String,
  buttonStyle: String,
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);

function handleClick() {
  emit('click');
}
</script>

<template>
  <button
    class="button"
    :class="{
      [`button--${ButtonStyle.Primary}`]: buttonStyle === ButtonStyle.Primary,
      [`button--${ButtonStyle.Secondary}`]:
        buttonStyle === ButtonStyle.Secondary,
      [`button--${ButtonStyle.Borderless}`]:
        buttonStyle === ButtonStyle.Borderless,
    }"
    type="button"
    @click="handleClick"
  >
    <q-spinner-dots v-if="isLoading" size="20px" color="primary" />

    <span v-else>
      <slot name="icon-prepend" />
      {{ text }}
    </span>
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.5%;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  width: fit-content;

  &--primary {
    color: white;
    background: var(--q-color-orange-300, #fc945a);
  }

  &--secondary {
    color: var(--q-color-orange-400, #fb7429);
    background: var(--q-color-orange-50, #fee5d7);
  }

  &--borderless {
    color: #73838c;
    background: transparent;
  }
}
</style>
