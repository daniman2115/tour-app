// data/favoritesStore.js
// Tiny shared store so the heart stays in sync between Home and the detail pages.
// Swap for Redux / your API later.
import { useSyncExternalStore } from "react";

let ids = [];
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const toggleFavorite = (id) => {
  ids = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  listeners.forEach((l) => l());
  return ids.includes(id); // true if now saved
};

export const useFavorites = () => useSyncExternalStore(subscribe, () => ids);