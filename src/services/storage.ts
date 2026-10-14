import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetState } from '../types/budget';
import { migrateBudget } from '../utils/budgetSchema';

export const STORAGE_KEY = '@bolsillo/budget-v1';

export async function loadBudget(): Promise<BudgetState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  return migrateBudget(JSON.parse(raw));
}

// La cola conserva el orden aunque el usuario haga cambios muy rápido.
let writeQueue: Promise<void> = Promise.resolve();
export function saveBudget(state: BudgetState): Promise<void> {
  const snapshot = JSON.stringify(state);
  const next = writeQueue.catch(() => undefined).then(() => AsyncStorage.setItem(STORAGE_KEY, snapshot));
  writeQueue = next;
  return next;
}
