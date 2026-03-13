'use client';

import React, { createContext, useContext, useReducer, useCallback, useState } from 'react';
import type { AppState, AppAction, User, ProductBatch, SupplyChainEvent, ScanRecord } from '@/src/types';
import { MOCK_BATCHES, MOCK_SCAN_HISTORY } from '@/src/data/mockData';

// ─── Initial state ─────────────────────────────────────────────────────────────
const initialState: AppState = {
  user: null,
  batches: MOCK_BATCHES,
  scanHistory: MOCK_SCAN_HISTORY,
};

// ─── Reducer ───────────────────────────────────────────────────────────────────
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'ADD_BATCH':
      return { ...state, batches: [action.payload, ...state.batches] };

    case 'UPDATE_BATCH':
      return {
        ...state,
        batches: state.batches.map((b) => (b.id === action.payload.id ? action.payload : b)),
      };

    case 'ADD_EVENT': {
      const { batchId, event } = action.payload;
      return {
        ...state,
        batches: state.batches.map((b) =>
          b.batchId === batchId ? { ...b, events: [...b.events, event] } : b
        ),
      };
    }

    case 'ADD_SCAN_RECORD':
      return { ...state, scanHistory: [action.payload, ...state.scanHistory] };

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// ─── Context value type ────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isApiConnected: boolean;
  login: (user: User) => void;
  logout: () => void;
  getBatchById: (batchId: string) => ProductBatch | undefined;
  addBatch: (batch: ProductBatch) => void;
  updateBatch: (batch: ProductBatch) => void;
  addEvent: (batchId: string, event: SupplyChainEvent) => void;
  addScanRecord: (record: ScanRecord) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isApiConnected, setIsApiConnected] = useState(false);

  const login = useCallback((user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
    setIsApiConnected(false); // stays false — demo mode
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'LOAD_STATE', payload: { batches: MOCK_BATCHES, scanHistory: MOCK_SCAN_HISTORY } });
    setIsApiConnected(false);
    // Clear any stored token safely
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem('ofts_jwt'); } catch { /* ignore */ }
    }
  }, []);

  const getBatchById = useCallback(
    (batchId: string) => state.batches.find((b) => b.batchId === batchId),
    [state.batches]
  );

  const addBatch = useCallback(
    (batch: ProductBatch) => dispatch({ type: 'ADD_BATCH', payload: batch }),
    []
  );

  const updateBatch = useCallback(
    (batch: ProductBatch) => dispatch({ type: 'UPDATE_BATCH', payload: batch }),
    []
  );

  const addEvent = useCallback(
    (batchId: string, event: SupplyChainEvent) =>
      dispatch({ type: 'ADD_EVENT', payload: { batchId, event } }),
    []
  );

  const addScanRecord = useCallback(
    (record: ScanRecord) => dispatch({ type: 'ADD_SCAN_RECORD', payload: record }),
    []
  );

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        isApiConnected,
        login,
        logout,
        getBatchById,
        addBatch,
        updateBatch,
        addEvent,
        addScanRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
