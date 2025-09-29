import { computed } from 'vue';
// --- SERVICES ---
import { useTransactionStore } from '@/services/stores/transactionStore';

export const useLocationSelector = () => {
  const transactionStore = useTransactionStore();

  const locationOptions = computed(
    () =>
      transactionStore.locations?.map((location) => ({
        label: location.name,
        value: location.id,
      })) ?? [],
  );

  const selectedLocationId = computed({
    get(): number | null {
      return transactionStore.transaction.selectedLocationId;
    },

    set(newValue: { label: string; value: number }): void {
      transactionStore.selectLocation(newValue.value);
    },
  });

  return {
    locationOptions,
    selectedLocationId,
  };
};
