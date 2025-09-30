import { ref } from 'vue';

/**
 * Simple loading state composable.
 * Provides a reactive boolean `isLoading` and a setter `setLoading`.
 * Useful for showing spinners or disabling UI during async operations.
 *
 * @returns {{ isLoading: import('vue').Ref<boolean>, setLoading: (loading: boolean) => void }}
 */
export const useLoading = () => {
  // Reactive flag indicating whether an async operation is in progress.
  const isLoading = ref(false);

  /**
   * Set the loading flag.
   *
   * @param {boolean} loading - true to mark loading, false to clear.
   * @returns {void}
   */
  function setLoading(loading: boolean): void {
    isLoading.value = loading;
  }

  return {
    isLoading,
    setLoading,
  };
};
