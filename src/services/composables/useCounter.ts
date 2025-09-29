export const useCounter = () => {
  let counter: number | null = null;

  const activeCounter = (fn: () => void, time: number): void => {
    counter = setInterval(fn, time);
  };

  const destroyCounter = (): void => {
    if (counter) {
      clearInterval(counter);
      counter = null;
    }
  };

  return {
    activeCounter,
    destroyCounter,
  };
};
