import { computed } from 'vue';
// --- SERVICES ---
import { useTransactionStore } from '@/services/stores/transactionStore';

/**
 * Composable that adapts transaction store locations into UI-friendly options
 * and provides a computed two-way binding for the selected location.
 *
 * - `locationOptions` is an array of { label, value } pairs suitable for selects.
 * - `selectedLocationId` is a computed with getter/setter that reads/writes
 *   the store's selectedLocationId.
 *
 * @returns {{ locationOptions: import('vue').ComputedRef<{label: string, value: number}[]>, selectedLocationId: import('vue').ComputedRef<number | null> }}
 */
export const useLocationSelector = () => {
  const transactionStore = useTransactionStore();

  // Map store locations into { label, value } options for UI selects.
  const locationOptions = computed(
    () =>
      transactionStore.locations?.map((location) => ({
        label: location.name,
        value: location.id,
      })) ?? [],
  );

  // Two-way computed for binding to a select component.
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
