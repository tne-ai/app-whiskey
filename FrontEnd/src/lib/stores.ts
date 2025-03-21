import { writable, derived } from 'svelte/store';
import type { FilterState } from './types';

// Define AppState interface
interface AppState {
  isUploading: boolean;
  data: any | null;
  error: string | null;
}

function createAppState() {
  const initialState: AppState = {
    isUploading: false,
    data: null,
    error: null
  };
  
  const { subscribe, set, update } = writable<AppState>(initialState);
  
  return {
    subscribe,
    setUploading: (value: boolean) => update(state => ({ ...state, isUploading: value })),
    setData: (data: any) => update(state => ({ ...state, data, error: null })),
    setError: (error: string) => update(state => ({ ...state, error })),
    resetState: () => set(initialState)
  };
}

export const appState = createAppState();

// Filter store
export const filters = writable<FilterState>({
  companyId: null,
  siteId: null,
  stageId: null,
  startDate: null,
  endDate: null
});

// Company name lookup cache
export const companyNames = writable<Record<number, string>>({});

// Site name lookup cache
export const siteNames = writable<Record<number, string>>({});

// Stage name lookup cache
export const stageNames = writable<Record<number, string>>({});

// Derived store to generate current filter description
export const filterDescription = derived(
  [filters, companyNames, siteNames, stageNames],
  ([$filters, $companyNames, $siteNames, $stageNames]) => {
    const parts: string[] = [];
    
    if ($filters.companyId !== null && $companyNames[$filters.companyId]) {
      parts.push(`Company: ${$companyNames[$filters.companyId]}`);
    }
    
    if ($filters.siteId !== null && $siteNames[$filters.siteId]) {
      parts.push(`Site: ${$siteNames[$filters.siteId]}`);
    }
    
    if ($filters.stageId !== null && $stageNames[$filters.stageId]) {
      parts.push(`Stage: ${$stageNames[$filters.stageId]}`);
    }
    
    if ($filters.startDate && $filters.endDate) {
      parts.push(`Period: ${formatDate($filters.startDate)} to ${formatDate($filters.endDate)}`);
    } else if ($filters.startDate) {
      parts.push(`From: ${formatDate($filters.startDate)}`);
    } else if ($filters.endDate) {
      parts.push(`Until: ${formatDate($filters.endDate)}`);
    }
    
    return parts.length > 0 ? `Showing data for ${parts.join(', ')}` : 'Showing all data';
  }
);

// Helper function to format dates
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
} 