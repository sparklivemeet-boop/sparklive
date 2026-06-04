export const storage = (() => {
  if (typeof window !== 'undefined' && 'electron' in window) {
    return {
      getItem: async (key: string) => {
        return window.localStorage.getItem(key);
      },
      setItem: async (key: string, value: string) => {
        return window.localStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        return window.localStorage.removeItem(key);
      },
    };
  }

  return {
    getItem: async (key: string) => window.localStorage.getItem(key),
    setItem: async (key: string, value: string) => window.localStorage.setItem(key, value),
    removeItem: async (key: string) => window.localStorage.removeItem(key),
  };
})();
