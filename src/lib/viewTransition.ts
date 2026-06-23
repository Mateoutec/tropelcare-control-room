export const runViewTransition = (callback: () => void): void => {
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(callback);
    return;
  }

  callback();
};
