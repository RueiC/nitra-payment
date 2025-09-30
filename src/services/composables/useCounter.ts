/**
 * Lightweight interval manager.
 * Returns control functions to start and stop a repeating callback.
 * Uses a local variable to keep track of the timer id so it can be cleared later.
 *
 * @returns {{ activeCounter: (fn: () => void, time: number) => void, destroyCounter: () => void }}
 */
export const useCounter = () => {
  // Holds the interval id returned by setInterval (or null when inactive).
  let counter: number | null = null;

  /**
   * Start a repeating timer that executes `fn` every `time` milliseconds.
   * If called multiple times, the previous timer will be replaced by the new id.
   *
   * @param {() => void} fn - Callback to execute on each tick.
   * @param {number} time - Interval time in milliseconds.
   * @returns {void}
   */
  const activeCounter = (fn: () => void, time: number): void => {
    counter = setInterval(fn, time);
  };

  /**
   * Stop the active interval (if any) and clear the stored id.
   * Safe to call multiple times.
   *
   * @returns {void}
   */
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
