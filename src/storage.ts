
declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<any>;
      set: (key: string, value: any) => Promise<void>;
      remove: (key: string) => Promise<void>;
    };
  }
}

window.storage = {
  async get(key: string) {
    const res = await fetch(`/api/get?key=${encodeURIComponent(key)}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  },

  async set(key: string, value: any) {
    await fetch("/api/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        value: JSON.stringify(value),
      }),
    });
  },

  async remove(key: string) {
    await fetch("/api/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        value: null,
      }),
    });
  },
};
