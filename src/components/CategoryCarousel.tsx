import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { Category, Expense } from '../types/budget';
import { CategoryCard } from './CategoryCard';
import { AppText } from './ui';

export function CategoryCarousel({ categories, expenses, onAdd, onEditCategory, onEditExpense }: {
  categories: Category[]; expenses: Expense[]; onAdd: (categoryId: string) => void;
  onEditCategory: (category: Category) => void; onEditExpense: (expense: Expense) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const previousWidth = useRef(0);
  const webScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [width, setWidth] = useState(0);
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [expensesExpanded, setExpensesExpanded] = useState(true);
  const index = Math.max(0, categories.findIndex(category => category.id === activeId));
  const expandedHeight = expensesExpanded
    ? Math.max(0, ...categories.filter(category => expenses.some(expense => expense.categoryId === category.id))
      .map(category => heights[category.id] ?? 0))
    : 0;
  // Mantener la altura de la página más alta evita que el contenido inferior
  // salte al cambiar de una categoría con gastos a otra vacía. La tarjeta
  // vacía ocupa esa misma altura y distribuye su contenido entre mensaje y pie.
  const carouselHeight = Math.max(0, ...categories.map(category => heights[category.id] ?? 0));

  // Conservar la categoría al rotar la pantalla o al añadir/eliminar categorías.
  useEffect(() => {
    if (width > 0) {
      scrollRef.current?.scrollTo({ x: index * width, animated: previousWidth.current === width });
      previousWidth.current = width;
    }
  }, [width, index]);

  useEffect(() => () => {
    if (webScrollTimer.current) clearTimeout(webScrollTimer.current);
  }, []);

  if (!categories.length) return null;

  return <View style={{ gap: 8 }}>
    <AppText variant="muted" accessibilityLiveRegion="polite" style={{ textAlign: 'center', fontSize: 12 }}>
      {index + 1} / {categories.length} · {categories[index].name}
    </AppText>
    <View testID="category-carousel" onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ overflow: 'hidden' }}>
      {width > 0 && <ScrollView ref={scrollRef} horizontal pagingEnabled disableIntervalMomentum
        showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" directionalLockEnabled
        contentContainerStyle={{ alignItems: 'flex-start' }} style={{ flexGrow: 0, height: carouselHeight || undefined }}
        scrollEventThrottle={16}
        onScroll={event => {
          // En web, la rueda/trackpad no siempre dispara el fin del gesto nativo.
          if (Platform.OS !== 'web') return;
          if (webScrollTimer.current) clearTimeout(webScrollTimer.current);
          const next = Math.round(event.nativeEvent.contentOffset.x / width);
          webScrollTimer.current = setTimeout(() => {
            if (categories[next]) setActiveId(categories[next].id);
          }, 150);
        }}
        onMomentumScrollEnd={event => {
          const next = Math.round(event.nativeEvent.contentOffset.x / width);
          if (categories[next]) setActiveId(categories[next].id);
        }}>
        {categories.map((category, pageIndex) => <View key={category.id} style={{ width: Math.max(0, width - 16), marginHorizontal: 8 }}
          accessibilityElementsHidden={pageIndex !== index} importantForAccessibility={pageIndex !== index ? 'no-hide-descendants' : 'auto'}
          aria-hidden={pageIndex !== index}
          onLayout={event => {
            const height = event.nativeEvent.layout.height;
            setHeights(previous => previous[category.id] === height ? previous : { ...previous, [category.id]: height });
          }}>
          <CategoryCard category={category} expenses={expenses.filter(expense => expense.categoryId === category.id)}
            expanded={expensesExpanded} onToggleExpenses={() => setExpensesExpanded(value => !value)}
            cardMinHeight={expensesExpanded && !expenses.some(expense => expense.categoryId === category.id) && expandedHeight > 0 ? expandedHeight : undefined}
            onAdd={() => onAdd(category.id)} onEditCategory={() => onEditCategory(category)} onEditExpense={onEditExpense} />
        </View>)}
      </ScrollView>}
    </View>
  </View>;
}
