import { ref } from 'vue';

export const useLoading = () => {
  const isLoading = ref(false);

  function setLoading(loading: boolean): void {
    isLoading.value = loading;
  }

  return {
    isLoading,
    setLoading,
  };
};
