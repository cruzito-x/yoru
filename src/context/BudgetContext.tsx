import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { initialBudget } from '../data/defaults';
import { BudgetState } from '../types/budget';
import { loadBudget, saveBudget } from '../services/storage';
import { BudgetAction, budgetReducer } from './budgetReducer';

interface BudgetContextValue {
  state: BudgetState;
  dispatch: React.Dispatch<BudgetAction>;
  ready: boolean;
  loadError: boolean;
  saveError: boolean;
  retryLoad: () => void;
  retrySave: () => void;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, undefined, initialBudget);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const generation = useRef(0);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    loadBudget().then(saved => {
      if (!active) return;
      if (saved) dispatch({ type: 'LOAD', state: saved });
      setReady(true);
    }).catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [loadAttempt]);

  useEffect(() => {
    // No guardar valores iniciales hasta haber terminado de leer.
    if (!ready) return;
    const current = ++generation.current;
    let active = true;
    saveBudget(state).then(() => {
      if (active && current === generation.current) setSaveError(false);
    }).catch(() => {
      if (active && current === generation.current) setSaveError(true);
    });
    return () => { active = false; };
  }, [state, ready, saveAttempt]);

  return <BudgetContext.Provider value={{
    state, dispatch, ready, loadError, saveError,
    retryLoad: () => setLoadAttempt(n => n + 1),
    retrySave: () => setSaveAttempt(n => n + 1),
  }}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudget debe usarse dentro de BudgetProvider.');
  return context;
}
