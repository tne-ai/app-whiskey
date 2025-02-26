import { writable } from 'svelte/store';

interface AppState {
  data: {
    modelAnalysis: string;
  } | null;
  error: string | null;
}

export const appState = writable<AppState>({
  data: null,
  error: null
}); 