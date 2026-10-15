import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, View } from 'react-native';
import { Category, Expense } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { CategoryCard } from './CategoryCard';
import { AppText } from './ui';

export function CategoryCarousel({ categories, expenses, onAdd, onEditCategory, onEditExpense, ordering, onMove }: {
  categories: Category[]; expenses: Expense[]; onAdd: (categoryId: string) => void;
  onEditCategory: (category: Category) => void; onEditExpense: (expense: Expense) => void;
  ordering: boolean; onMove: (categoryId: string, index: number) => void;
}) {
  const { colors } = useTheme();
  const layouts = useRef<Record<string, { y: number; height: number }>>({});
  const scrollRef = useRef<ScrollView>(null);
  const knownCategoryIds = useRef(new Set(categories.map(category => category.id)));
  const webScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [width, setWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(categories.map(category => category.id)));
  const pages = Array.from({ length: Math.ceil(categories.length / 2) }, (_, pageIndex) => categories.slice(pageIndex * 2, pageIndex * 2 + 2));
  const scrollbarGap = 12;
  const pageHeight = Math.max(0, ...pages.map(page => page.reduce((total, category) => total + (heights[category.id] ?? 0), 0)
    + (page.length > 1 ? 10 : 0))) + scrollbarGap;
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      #category-scroll-area::-webkit-scrollbar { height: 6px; }
      #category-scroll-area::-webkit-scrollbar-track { background: transparent; }
      #category-scroll-area::-webkit-scrollbar-thumb { background: ${colors.muted}33; border-radius: 999px; }
      #category-scroll-area { scrollbar-width: thin; scrollbar-color: ${colors.muted}33 transparent; scroll-snap-type: x mandatory; }
      #category-scroll-area [id^="category-page-"] { scroll-snap-align: start; scroll-snap-stop: always; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, [colors.muted]);

  useEffect(() => () => {
    if (webScrollTimer.current) clearTimeout(webScrollTimer.current);
  }, []);

  useEffect(() => {
    const currentIds = new Set(categories.map(category => category.id));
    const added = categories.filter(category => !knownCategoryIds.current.has(category.id));
    const removed = [...knownCategoryIds.current].some(id => !currentIds.has(id));
    if (added.length || removed) {
      setExpandedCategories(previous => {
        const next = new Set([...previous].filter(id => currentIds.has(id)));
        added.forEach(category => next.add(category.id));
        return next;
      });
      knownCategoryIds.current = currentIds;
    }
  }, [categories]);

  if (!categories.length) return null;

  function finishDrag(categoryId: string, offsetX: number, offsetY: number) {
    const origin = layouts.current[categoryId];
    if (origin) {
      const originIndex = categories.findIndex(category => category.id === categoryId);
      const pageIndex = Math.max(0, Math.min(pages.length - 1,
        Math.floor(originIndex / 2) + Math.round(offsetX / Math.max(width, 1))));
      const pageStart = pageIndex * 2;
      const targetPage = categories.slice(pageStart, pageStart + 2);
      const center = origin.y + offsetY + origin.height / 2;
      let targetIndex = Math.min(originIndex, categories.length - 1);
      let closestDistance = Infinity;
      targetPage.forEach((category, indexInPage) => {
        const layout = layouts.current[category.id];
        if (!layout) return;
        const categoryCenter = layout.y + layout.height / 2;
        const distance = Math.abs(categoryCenter - center);
        if (distance < closestDistance) {
          targetIndex = pageStart + indexInPage;
          closestDistance = distance;
        }
      });
      if (targetPage.length) {
        scrollRef.current?.scrollTo({ x: pageIndex * width, animated: true });
        setCurrentPage(pageIndex);
      }
      onMove(categoryId, targetIndex);
    }
    setDraggingId(null);
    setDragOffsetX(0);
    setDragOffset(0);
  }

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!width) return;
    if (webScrollTimer.current) clearTimeout(webScrollTimer.current);
    const nextPage = Math.max(0, Math.min(pages.length - 1, Math.round(event.nativeEvent.contentOffset.x / width)));
    if (nextPage !== currentPage) setExpandedCategories(new Set());
    setCurrentPage(nextPage);
  }

  return <View style={{ gap: 8 }}>
    <View onLayout={handleLayout} style={{ overflow: 'hidden' }}>
    {width > 0 && <ScrollView ref={scrollRef} nativeID="category-scroll-area" testID="category-list" horizontal pagingEnabled
      showsHorizontalScrollIndicator persistentScrollbar={Platform.OS === 'android'}
      keyboardShouldPersistTaps="handled" directionalLockEnabled
      onMomentumScrollEnd={handleScrollEnd}
      onScroll={event => {
        if (Platform.OS !== 'web' || !width) return;
        if (webScrollTimer.current) clearTimeout(webScrollTimer.current);
        const nextPage = Math.max(0, Math.min(pages.length - 1, Math.round(event.nativeEvent.contentOffset.x / width)));
        webScrollTimer.current = setTimeout(() => {
          if (nextPage !== currentPage) setExpandedCategories(new Set());
          setCurrentPage(nextPage);
        }, 150);
      }}
      style={{ width, height: pageHeight || undefined, flexGrow: 0 }}
      contentContainerStyle={{ alignItems: 'flex-start' }}>
      {pages.map((page, pageIndex) => <View key={`page-${pageIndex}`} nativeID={`category-page-${pageIndex}`}
        style={{ width: Math.max(0, width - 16), height: pageHeight || undefined, gap: 10, paddingBottom: scrollbarGap, marginHorizontal: 8 }}>
        {page.map(category => {
          const categoryExpenses = expenses.filter(expense => expense.categoryId === category.id);
          const isDragging = draggingId === category.id;
          const isExpanded = expandedCategories.has(category.id);
          return <View key={category.id}
            onLayout={event => {
              const { y, height } = event.nativeEvent.layout;
              layouts.current[category.id] = { y, height };
              setHeights(previous => previous[category.id] === height ? previous : { ...previous, [category.id]: height });
            }}
            style={{ zIndex: isDragging ? 2 : 0, elevation: isDragging ? 4 : 0,
              transform: [{ translateX: isDragging ? dragOffsetX : 0 }, { translateY: isDragging ? dragOffset : 0 }], opacity: isDragging ? 0.88 : 1 }}>
            <CategoryCard category={category} expenses={categoryExpenses} expanded={isExpanded}
              onToggleExpenses={() => setExpandedCategories(previous => {
                const next = new Set(previous);
                if (next.has(category.id)) next.delete(category.id);
                else next.add(category.id);
                return next;
              })} ordering={ordering}
              onDragStart={() => { setDraggingId(category.id); setDragOffsetX(0); setDragOffset(0); }}
              onDragMove={(offsetX, offsetY) => { setDragOffsetX(offsetX); setDragOffset(offsetY); }}
              onDragEnd={(offsetX, offsetY) => finishDrag(category.id, offsetX, offsetY)}
              onAdd={() => onAdd(category.id)} onEditCategory={() => onEditCategory(category)} onEditExpense={onEditExpense} />
          </View>;
        })}
      </View>)}
    </ScrollView>}
    </View>
    <AppText variant="muted" accessibilityLiveRegion="polite" style={{ textAlign: 'center', fontSize: 12 }}>
      {`${Math.min(2, categories.length - currentPage * 2)} de ${categories.length}`}
    </AppText>
  </View>;
}
