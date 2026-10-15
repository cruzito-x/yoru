import React, { createContext, useContext, useMemo, useState } from 'react';

type CategoryOrderingContextValue = {
  orderingCategories: boolean;
  setOrderingCategories: React.Dispatch<React.SetStateAction<boolean>>;
};

const CategoryOrderingContext = createContext<CategoryOrderingContextValue | null>(null);

export function CategoryOrderingProvider({ children }: { children: React.ReactNode }) {
  const [orderingCategories, setOrderingCategories] = useState(false);
  const value = useMemo(() => ({ orderingCategories, setOrderingCategories }), [orderingCategories]);
  return <CategoryOrderingContext.Provider value={value}>{children}</CategoryOrderingContext.Provider>;
}

export function useCategoryOrdering() {
  const context = useContext(CategoryOrderingContext);
  if (!context) throw new Error('useCategoryOrdering debe usarse dentro de CategoryOrderingProvider.');
  return context;
}
