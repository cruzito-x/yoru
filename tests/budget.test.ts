import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialBudget } from '../src/data/defaults';
import { budgetReducer } from '../src/context/budgetReducer';
import { bonusInRange, categoryTotals, expensesInRange, groupByDay, salaryAt, totalExpenses } from '../src/utils/budget';
import { calendarDays, dateKey, fortnight, historyRange, isDecember, isJanuary, isQuincena25PaymentDate, isValidDate, localDate, moveFortnight, movePeriod } from '../src/utils/dates';
import { isBudgetState, migrateBudget } from '../src/utils/budgetSchema';
import { parseMoney, percentage } from '../src/utils/money';
import { adjustPaymentDate, calendarPayments, isValidPaymentSchedule, paymentsForMonth, upcomingPayments } from '../src/utils/payments';
import type { Expense } from '../src/types/budget';
import { annualBonusSalaryDays, calculateAnnualBonus, calculateQuincena25, isValidPayrollSettings } from '../src/utils/payroll';
import { hexToHsv, hsvToHex, normalizeHexColor } from '../src/utils/colors';

test('Planilla: aguinaldo de 15, 19 y 21 días en los límites exactos de antigüedad', () => {
  for (const [serviceMonths, days, expected] of [[12, 15, 25000], [18, 15, 25000], [35, 15, 25000],
    [36, 19, 31667], [119, 19, 31667], [120, 21, 35000], [121, 21, 35000]]) {
    assert.equal(annualBonusSalaryDays(serviceMonths), days);
    assert.equal(calculateAnnualBonus({ monthlySalaryCents: 50000, serviceMonths }), expected);
  }
  assert.equal(calculateAnnualBonus({ monthlySalaryCents: 50001, serviceMonths: 36 }), 31667);
  assert.equal(calculateAnnualBonus({ monthlySalaryCents: 99999999, serviceMonths: 120 }), 69999999);
  assert.equal(calculateQuincena25(50000), 25000);
  assert.equal(calculateQuincena25(50001), 25001);
});

test('Planilla: rechaza antigüedad fuera de las reglas y montos inválidos', () => {
  for (const serviceMonths of [0, 11, -12, 18.5, 1201, NaN]) {
    assert.equal(isValidPayrollSettings({ monthlySalaryCents: 50000, serviceMonths, travelAllowanceCents: 0 }), false);
    assert.throws(() => annualBonusSalaryDays(serviceMonths));
  }
  for (const monthlySalaryCents of [0, -1, 50000.5, 100000000, NaN]) {
    assert.equal(isValidPayrollSettings({ monthlySalaryCents, serviceMonths: 18, travelAllowanceCents: 0 }), false);
    assert.throws(() => calculateQuincena25(monthlySalaryCents));
    assert.throws(() => calculateAnnualBonus({ monthlySalaryCents, serviceMonths: 18 }));
  }
});

test('Planilla: configuración persistente sin modificar sueldo ni ingresos registrados', () => {
  const original = { ...initialBudget(), expenses,
    annualBonuses: [{ year: 2026, date: '2026-12-15', amountCents: 25000 }],
    quincena25Entries: [{ year: 2026, date: '2026-01-15', amountCents: 25000 }] };
  const changed = budgetReducer(original, { type: 'SET_PAYROLL', settings: { monthlySalaryCents: 70000, serviceMonths: 36, travelAllowanceCents: 0 } });
  assert.deepEqual(changed.salaryHistory, original.salaryHistory);
  assert.deepEqual(changed.annualBonuses, original.annualBonuses);
  assert.deepEqual(changed.quincena25Entries, original.quincena25Entries);
  assert.deepEqual(changed.expenses, original.expenses);
  assert.equal(original.payrollSettings.monthlySalaryCents, 50000);
  assert.equal(calculateAnnualBonus(changed.payrollSettings), 44333);
  assert.deepEqual(migrateBudget(JSON.parse(JSON.stringify(changed))), changed);
  assert.equal(budgetReducer(changed, { type: 'SET_PAYROLL', settings: { monthlySalaryCents: 0, serviceMonths: 36, travelAllowanceCents: 0 } }), changed);
});

test('Migración v4 a v9: conserva registros históricos e inicializa datos nuevos', () => {
  const { payrollSettings, ...previous } = initialBudget();
  const legacy = { ...previous, version: 4, fixedExpenses: undefined, expenses,
    annualBonuses: [{ year: 2026, date: '2026-12-15', amountCents: 20000 }],
    quincena25Entries: [{ year: 2026, date: '2026-01-15', amountCents: 15000 }], themeMode: 'dark' };
  const migrated = migrateBudget(JSON.parse(JSON.stringify(legacy)));
  assert.equal(migrated.version, 9);
  assert.deepEqual(migrated.payrollSettings, { monthlySalaryCents: 50000, serviceMonths: 18, travelAllowanceCents: 15000 });
  for (const key of ['expenses', 'categories', 'salaryHistory', 'themeMode', 'annualBonuses', 'quincena25Entries'] as const) {
    assert.deepEqual(migrated[key], legacy[key]);
  }
  const newState = initialBudget();
  assert.equal(isBudgetState({ ...newState, payrollSettings: undefined }), false);
  assert.equal(isBudgetState({ ...newState, payrollSettings: { ...payrollSettings, serviceMonths: 11 } }), false);
  assert.equal(isBudgetState(migrated), true);
});

test('Colores: selección HSV y HEX producen colores persistibles y conservan sus canales', () => {
  for (const color of ['#FF0000', '#00FF00', '#0000FF', '#000000', '#FFFFFF', '#808080', '#38A3F1', '#C56839']) {
    assert.equal(hsvToHex(hexToHsv(color)), color);
    const original = initialBudget();
    const changed = budgetReducer(original, { type: 'SAVE_CATEGORY', category: { ...original.categories[0], color } });
    assert.equal(migrateBudget(JSON.parse(JSON.stringify(changed))).categories[0].color, color);
  }
  assert.equal(hsvToHex({ h: 180, s: 1, v: 1 }), '#00FFFF');
  assert.equal(hsvToHex({ h: 360, s: 1, v: 1 }), '#FF0000');
  assert.equal(normalizeHexColor(' 38a3f1 '), '#38A3F1');
  for (const value of ['#FFF', '#12345G', '', '#12345678', 'red']) assert.equal(normalizeHexColor(value), null);
});

test('Quincena 25: pagos del 15 al 25 de enero, con límites inclusivos', () => {
  assert.ok(isJanuary('2027-01-01'));
  assert.ok(isJanuary('2027-01-31'));
  for (const date of ['2026-12-31', '2027-02-01', '2027-01-32', '2027-1-15']) assert.equal(isJanuary(date), false);
  for (const date of ['2027-01-15', '2027-01-20', '2027-01-25']) assert.ok(isQuincena25PaymentDate(date));
  for (const date of ['2027-01-01', '2027-01-14', '2027-01-26', '2027-01-31', '2027-02-15', '2027-01-32']) {
    assert.equal(isQuincena25PaymentDate(date), false);
  }
});

test('Quincena 25: editar no duplica, conserva años y un monto cero retira el ingreso', () => {
  const first = budgetReducer(initialBudget(), { type: 'SET_QUINCENA_25', entry: { year: 2026, date: '2026-01-15', amountCents: 10000 } });
  const second = budgetReducer(first, { type: 'SET_QUINCENA_25', entry: { year: 2027, date: '2027-01-18', amountCents: 20000 } });
  const edited = budgetReducer(second, { type: 'SET_QUINCENA_25', entry: { year: 2027, date: '2027-01-20', amountCents: 25000 } });
  assert.equal(edited.quincena25Entries.length, 2);
  assert.equal(bonusInRange(edited.quincena25Entries, fortnight('2027-01-14')), 0);
  assert.equal(bonusInRange(edited.quincena25Entries, fortnight('2027-01-15')), 25000);
  assert.equal(bonusInRange(edited.quincena25Entries, fortnight('2026-01-15')), 10000);
  assert.equal(bonusInRange(edited.quincena25Entries, fortnight('2027-02-15')), 0);
  assert.equal(second.quincena25Entries[1].amountCents, 20000);
  const removed = budgetReducer(edited, { type: 'SET_QUINCENA_25', entry: { year: 2027, date: '2027-01-20', amountCents: 0 } });
  assert.equal(bonusInRange(removed.quincena25Entries, fortnight('2027-01-15')), 0);
});

test('Quincena 25: rechaza fechas fuera del 15–25, años distintos y montos inválidos', () => {
  const state = initialBudget();
  for (const entry of [
    { year: 2027, date: '2027-01-14', amountCents: 10000 },
    { year: 2027, date: '2027-01-26', amountCents: 10000 },
    { year: 2027, date: '2027-01-01', amountCents: 0 },
    { year: 2027, date: '2027-02-15', amountCents: 10000 },
    { year: 2026, date: '2027-01-15', amountCents: 10000 },
    { year: 2027, date: '2027-01-32', amountCents: 10000 },
    { year: 2027, date: '2027-01-15', amountCents: -1 },
    { year: 2027, date: '2027-01-15', amountCents: 100.5 },
    { year: 2027, date: '2027-01-15', amountCents: 100000000 },
  ]) assert.equal(budgetReducer(state, { type: 'SET_QUINCENA_25', entry }), state);
  for (const date of ['2027-01-15', '2027-01-25']) {
    assert.equal(budgetReducer(state, { type: 'SET_QUINCENA_25', entry: { year: 2027, date, amountCents: 25000 } }).quincena25Entries[0].date, date);
  }
});

test('Quincena 25: conserva fechas antiguas sin cambiar saldos y permite retirarlas', () => {
  const original = { ...initialBudget(), quincena25Entries: [{ year: 2027, date: '2027-01-05', amountCents: 25000 }] };
  assert.deepEqual(migrateBudget(JSON.parse(JSON.stringify(original))), original);
  assert.equal(bonusInRange(original.quincena25Entries, fortnight('2027-01-01')), 25000);
  assert.equal(budgetReducer(original, { type: 'SET_QUINCENA_25', entry: { ...original.quincena25Entries[0], amountCents: 30000 } }), original);
  const removed = budgetReducer(original, { type: 'SET_QUINCENA_25', entry: { ...original.quincena25Entries[0], amountCents: 0 } });
  assert.equal(bonusInRange(removed.quincena25Entries, fortnight('2027-01-01')), 0);
  const corrected = budgetReducer(original, { type: 'SET_QUINCENA_25', entry: { year: 2027, date: '2027-01-15', amountCents: 25000 } });
  assert.equal(corrected.quincena25Entries.length, 1);
  assert.equal(bonusInRange(corrected.quincena25Entries, fortnight('2027-01-01')), 0);
  assert.equal(bonusInRange(corrected.quincena25Entries, fortnight('2027-01-15')), 25000);
});

test('Ingresos unificados: guarda sueldo y planilla, mantiene períodos e ingresos anteriores', () => {
  const original = { ...initialBudget(), annualBonuses: [{ year: 2025, date: '2025-12-15', amountCents: 25000 }],
    quincena25Entries: [{ year: 2025, date: '2025-01-20', amountCents: 25000 }], expenses };
  const changed = budgetReducer(original, { type: 'SET_INCOME_SETTINGS', salary: { from: '2026-10-15', amountCents: 35000 },
    payroll: { monthlySalaryCents: 70000, serviceMonths: 36, travelAllowanceCents: 15000 } });
  assert.equal(salaryAt(changed.salaryHistory, '2026-10-01'), 29938);
  assert.equal(salaryAt(changed.salaryHistory, '2026-10-15'), 35000);
  assert.equal(salaryAt(changed.salaryHistory, '2026-11-01'), 35000);
  assert.equal(calculateQuincena25(changed.payrollSettings.monthlySalaryCents), 35000);
  assert.equal(calculateAnnualBonus(changed.payrollSettings), 44333);
  for (const key of ['expenses', 'annualBonuses', 'quincena25Entries']) assert.deepEqual(changed[key as keyof typeof changed], original[key as keyof typeof original]);
  assert.deepEqual(migrateBudget(JSON.parse(JSON.stringify(changed))), changed);
  const payrollOnly = budgetReducer(changed, { type: 'SET_INCOME_SETTINGS', salary: { from: '2026-11-01', amountCents: 35000 },
    payroll: { monthlySalaryCents: 80000, serviceMonths: 36, travelAllowanceCents: 15000 } });
  assert.equal(payrollOnly.salaryHistory, changed.salaryHistory);
  assert.equal(original.salaryHistory.length, 1);
});

test('Ingresos unificados: un campo inválido impide cualquier cambio parcial', () => {
  const original = initialBudget();
  const validSalary = { from: '2026-10-15', amountCents: 35000 };
  const validPayroll = { monthlySalaryCents: 70000, serviceMonths: 36, travelAllowanceCents: 15000 };
  for (const salary of [{ ...validSalary, amountCents: -1 }, { ...validSalary, amountCents: 35000.5 },
    { ...validSalary, amountCents: 100000000 }, { ...validSalary, from: '2026-02-30' }]) {
    assert.equal(budgetReducer(original, { type: 'SET_INCOME_SETTINGS', salary, payroll: validPayroll }), original);
  }
  for (const payroll of [{ ...validPayroll, monthlySalaryCents: 0 }, { ...validPayroll, serviceMonths: 11 }]) {
    assert.equal(budgetReducer(original, { type: 'SET_INCOME_SETTINGS', salary: validSalary, payroll }), original);
  }
  assert.equal(salaryAt(budgetReducer(original, { type: 'SET_INCOME_SETTINGS', salary: { ...validSalary, amountCents: 0 },
    payroll: validPayroll }).salaryHistory, '2026-10-15'), 0);
});

test('Migración v3 y persistencia v9: mantiene gastos, pagos, sueldo, tema y aguinaldos', () => {
  const { quincena25Entries, ...original } = initialBudget();
  const previous = { ...original, version: 3, expenses, themeMode: 'dark', paymentSchedule: { first: 15, second: 'last' },
    annualBonuses: [{ year: 2026, date: '2026-12-15', amountCents: 15000 }] };
  const migrated = migrateBudget(JSON.parse(JSON.stringify(previous)));
  assert.equal(migrated.version, 9);
  assert.deepEqual(migrated.quincena25Entries, []);
  for (const key of ['expenses', 'categories', 'salaryHistory', 'themeMode', 'paymentSchedule', 'annualBonuses'] as const) {
    assert.deepEqual(migrated[key], previous[key]);
  }
  const saved = budgetReducer(migrated, { type: 'SET_QUINCENA_25', entry: { year: 2027, date: '2027-01-15', amountCents: 20000 } });
  assert.deepEqual(migrateBudget(JSON.parse(JSON.stringify(saved))), saved);
  assert.equal(isBudgetState({ ...saved, quincena25Entries: [...saved.quincena25Entries, ...saved.quincena25Entries] }), false);
  assert.equal(isBudgetState({ ...saved, quincena25Entries: [{ year: 2027, date: '2027-02-15', amountCents: 20000 }] }), false);
  assert.equal(isBudgetState({ ...saved, quincena25Entries: undefined }), false);
});

test('Importes: admite punto/coma y conserva centavos exactos', () => {
  assert.equal(parseMoney('2.25'), 225);
  assert.equal(parseMoney('0,65'), 65);
  assert.equal(parseMoney(' 38 '), 3800);
  assert.equal(parseMoney('1.2'), 120);
  assert.equal(parseMoney('0'), 0);
  assert.equal(parseMoney('999999.99'), 99999999);
  assert.equal(parseMoney('0.10')! + parseMoney('0.20')!, 30);
});

test('Importes: rechaza negativos, notación científica y decimales inválidos', () => {
  for (const invalid of ['', '-2', 'NaN', '1e3', '1.234', '3,2.1', '1,000.50', '1000000', '.50']) {
    assert.equal(parseMoney(invalid), null, invalid);
  }
});

test('Porcentajes: sin división por cero y con déficit visible', () => {
  assert.equal(percentage(15000, 30000), 50);
  assert.ok(Math.abs(percentage(33000, 30000) - 110) < 1e-10);
  assert.equal(percentage(0, 0), 0);
});

test('Fechas locales: valida meses, bisiestos y formato', () => {
  for (const valid of ['2024-02-29', '2026-10-31', '1900-01-01', '2100-12-31']) assert.ok(isValidDate(valid), valid);
  for (const invalid of ['2026-02-29', '2026-04-31', '2026-00-10', '2026-13-01', '2026-1-01', '1899-01-01', 'texto']) {
    assert.equal(isValidDate(invalid), false, invalid);
  }
  assert.equal(dateKey(new Date(2026, 9, 15, 0, 0)), '2026-10-15');
});

test('Quincenas: separa el día 14 del 15 y contempla el final de febrero', () => {
  assert.deepEqual(fortnight('2026-10-14'), { start: '2026-10-01', end: '2026-10-14' });
  assert.deepEqual(fortnight('2026-10-15'), { start: '2026-10-15', end: '2026-10-31' });
  assert.deepEqual(fortnight('2024-02-29'), { start: '2024-02-15', end: '2024-02-29' });
  assert.deepEqual(fortnight('2026-02-28'), { start: '2026-02-15', end: '2026-02-28' });
});

test('Navegación de quincenas: atraviesa meses y años', () => {
  assert.equal(moveFortnight('2026-10-20', -1), '2026-10-01');
  assert.equal(moveFortnight('2026-10-20', 1), '2026-11-01');
  assert.equal(moveFortnight('2026-01-05', -1), '2025-12-15');
  assert.equal(moveFortnight('2026-12-25', 1), '2027-01-01');
});

test('Historial: semana de lunes a domingo, incluso cruzando el año', () => {
  assert.deepEqual(historyRange('day', '2026-10-10'), { start: '2026-10-10', end: '2026-10-10' });
  assert.deepEqual(historyRange('week', '2026-10-11'), { start: '2026-10-05', end: '2026-10-11' });
  assert.deepEqual(historyRange('week', '2027-01-01'), { start: '2026-12-28', end: '2027-01-03' });
  assert.deepEqual(historyRange('month', '2024-02-29'), { start: '2024-02-01', end: '2024-02-29' });
  assert.deepEqual(historyRange('year', '2026-10-10'), { start: '2026-01-01', end: '2026-12-31' });
});

test('Navegación: el 31 de enero no se salta febrero', () => {
  assert.equal(movePeriod('month', '2026-01-31', 1), '2026-02-01');
  assert.equal(movePeriod('month', '2026-12-31', 1), '2027-01-01');
  assert.equal(movePeriod('year', '2024-02-29', 1), '2025-01-01');
  assert.equal(movePeriod('week', '2026-10-10', -1), '2026-10-03');
});

const expenses: Expense[] = [
  { id: '1', name: 'Desayuno', amountCents: 100, categoryId: 'food', date: '2026-10-14', note: '' },
  { id: '2', name: 'Almuerzo', amountCents: 290, categoryId: 'food', date: '2026-10-15', note: '' },
  { id: '3', name: 'Pasaje', amountCents: 60, categoryId: 'transport', date: '2026-10-31', note: '' },
  { id: '4', name: 'Internet', amountCents: 3000, categoryId: 'services', date: '2026-11-01', note: '' },
];

test('Gastos: incluye los límites del período y excluye otras quincenas', () => {
  const selected = expensesInRange(expenses, fortnight('2026-10-15'));
  assert.deepEqual(selected.map(e => e.id), ['3', '2']);
  assert.equal(totalExpenses(selected), 350);
  assert.equal(categoryTotals(initialBudget().categories, selected).find(c => c.id === 'food')?.total, 290);
  assert.deepEqual(groupByDay(selected).map(g => g.date), ['2026-10-31', '2026-10-15']);
  assert.equal(totalExpenses([]), 0);
});

test('Reducer: crear y editar gastos no duplica filas y no muta el original', () => {
  const original = initialBudget();
  const added = budgetReducer(original, { type: 'SAVE_EXPENSE', expense: expenses[0] });
  assert.equal(original.expenses.length, 0);
  const edited = budgetReducer(added, { type: 'SAVE_EXPENSE', expense: { ...expenses[0], amountCents: 200 } });
  assert.equal(edited.expenses.length, 1);
  assert.equal(edited.expenses[0].amountCents, 200);
  assert.equal(added.expenses[0].amountCents, 100);
  assert.equal(budgetReducer(edited, { type: 'DELETE_EXPENSE', id: '1' }).expenses.length, 0);
});

test('Reducer: conserva categorías usadas y rechaza categorías inexistentes', () => {
  const original = initialBudget();
  const added = budgetReducer(original, { type: 'SAVE_EXPENSE', expense: expenses[0] });
  assert.equal(budgetReducer(added, { type: 'DELETE_CATEGORY', id: 'food' }), added);
  assert.equal(budgetReducer(original, { type: 'SAVE_EXPENSE', expense: { ...expenses[0], categoryId: 'missing' } }), original);
  assert.equal(budgetReducer(original, { type: 'DELETE_CATEGORY', id: 'food' }).categories.length, 3);
});

test('Reducer: actualiza una categoría conservando sus gastos', () => {
  const added = budgetReducer(initialBudget(), { type: 'SAVE_EXPENSE', expense: expenses[0] });
  const edited = budgetReducer(added, { type: 'SAVE_CATEGORY', category: { id: 'food', name: 'Comidas', color: '#C56839' } });
  assert.equal(edited.categories.length, 4);
  assert.equal(edited.categories[0].name, 'Comidas');
  assert.equal(edited.expenses[0].categoryId, 'food');
});

test('Sueldo: cambiarlo conserva períodos anteriores y se aplica a los siguientes', () => {
  const original = initialBudget();
  const increased = budgetReducer(original, { type: 'SET_SALARY', entry: { from: '2026-10-15', amountCents: 35000 } });
  assert.equal(salaryAt(increased.salaryHistory, '2026-10-01'), 29938);
  assert.equal(salaryAt(increased.salaryHistory, '2026-10-15'), 35000);
  assert.equal(salaryAt(increased.salaryHistory, '2027-01-01'), 35000);
  const corrected = budgetReducer(increased, { type: 'SET_SALARY', entry: { from: '2026-10-15', amountCents: 32500 } });
  assert.equal(corrected.salaryHistory.length, 2);
  assert.equal(salaryAt(corrected.salaryHistory, '2026-10-15'), 32500);
});

test('Tema: persiste como dato global y admite serialización completa', () => {
  const changed = budgetReducer(initialBudget(), { type: 'SET_THEME', mode: 'dark' });
  assert.equal(changed.themeMode, 'dark');
  assert.deepEqual(JSON.parse(JSON.stringify(changed)), changed);
});

test('Calendario: semanas completas de lunes a domingo y febrero bisiesto', () => {
  for (const month of ['2024-02-01', '2026-02-01', '2026-10-01', '2026-12-01']) {
    const days = calendarDays(month);
    assert.equal(days.length % 7, 0);
    assert.equal(localDate(days[0]).getDay(), 1);
    assert.equal(localDate(days.at(-1)!).getDay(), 0);
    assert.ok(days.every(isValidDate));
    assert.equal(new Set(days).size, days.length);
  }
  assert.ok(calendarDays('2024-02-01').includes('2024-02-29'));
  assert.ok(!calendarDays('2026-02-01').includes('2026-02-29'));
});

test('Aguinaldo: solo se habilita en fechas válidas de diciembre', () => {
  assert.equal(isDecember('2026-12-01'), true);
  assert.equal(isDecember('2026-12-31'), true);
  for (const date of ['2026-10-10', '2026-11-30', '2027-01-01', '2026-12-32']) assert.equal(isDecember(date), false);
});

test('Calendario recurrente: guarda dos reglas, desactiva y rechaza colisiones', () => {
  const original = { ...initialBudget(), nextPaymentDate: '2026-10-15' };
  const selected = budgetReducer(original, { type: 'SET_PAYMENT_SCHEDULE', schedule: { first: 15, second: 'last' } });
  assert.deepEqual(selected.paymentSchedule, { first: 15, second: 'last' });
  assert.equal(selected.nextPaymentDate, null);
  assert.equal(original.paymentSchedule, null);
  assert.equal(budgetReducer(selected, { type: 'SET_PAYMENT_SCHEDULE', schedule: { first: 30, second: 31 } }), selected);
  assert.equal(budgetReducer(selected, { type: 'SET_PAYMENT_SCHEDULE', schedule: null }).paymentSchedule, null);
});

test('Aguinaldo: editar reemplaza el monto del año y conserva años anteriores', () => {
  const first = budgetReducer(initialBudget(), { type: 'SET_ANNUAL_BONUS', bonus: { year: 2025, date: '2025-12-15', amountCents: 15000 } });
  const second = budgetReducer(first, { type: 'SET_ANNUAL_BONUS', bonus: { year: 2026, date: '2026-12-15', amountCents: 20000 } });
  const edited = budgetReducer(second, { type: 'SET_ANNUAL_BONUS', bonus: { year: 2026, date: '2026-12-20', amountCents: 25000 } });
  assert.equal(edited.annualBonuses.length, 2);
  assert.equal(edited.annualBonuses.find(b => b.year === 2026)?.amountCents, 25000);
  assert.equal(edited.annualBonuses.find(b => b.year === 2025)?.amountCents, 15000);
  assert.equal(second.annualBonuses.find(b => b.year === 2026)?.amountCents, 20000);
});

test('Aguinaldo: rechaza otros meses, otro año y montos negativos', () => {
  const state = initialBudget();
  for (const bonus of [
    { year: 2026, date: '2026-11-15', amountCents: 20000 },
    { year: 2027, date: '2026-12-15', amountCents: 20000 },
    { year: 2026, date: '2026-12-15', amountCents: -100 },
    { year: 2026, date: '2026-12-15', amountCents: 100.5 },
  ]) assert.equal(budgetReducer(state, { type: 'SET_ANNUAL_BONUS', bonus }), state);
});

test('Aguinaldo: solo aumenta el saldo de la quincena de su fecha', () => {
  const state = budgetReducer(initialBudget(), { type: 'SET_ANNUAL_BONUS', bonus: { year: 2026, date: '2026-12-15', amountCents: 20000 } });
  assert.equal(bonusInRange(state.annualBonuses, fortnight('2026-12-14')), 0);
  assert.equal(bonusInRange(state.annualBonuses, fortnight('2026-12-15')), 20000);
  assert.equal(bonusInRange(state.annualBonuses, fortnight('2027-01-01')), 0);
  const removed = budgetReducer(state, { type: 'SET_ANNUAL_BONUS', bonus: { year: 2026, date: '2026-12-15', amountCents: 0 } });
  assert.equal(bonusInRange(removed.annualBonuses, fortnight('2026-12-15')), 0);
});

test('Migración: los datos de la versión 1 conservan gastos, sueldo y tema', () => {
  const original = { ...initialBudget(), expenses, themeMode: 'dark' as const };
  const { nextPaymentDate, annualBonuses, paymentSchedule, ...common } = original;
  const legacy = { ...common, version: 1 };
  const migrated = migrateBudget(JSON.parse(JSON.stringify(legacy)));
  assert.equal(migrated.version, 9);
  assert.deepEqual(migrated.expenses, expenses);
  assert.deepEqual(migrated.categories, original.categories);
  assert.deepEqual(migrated.salaryHistory, original.salaryHistory);
  assert.equal(migrated.themeMode, 'dark');
  assert.equal(migrated.nextPaymentDate, null);
  assert.deepEqual(migrated.annualBonuses, []);
  assert.equal(legacy.version, 1);
});

test('Persistencia: valida pago y aguinaldo y rechaza datos incompletos', () => {
  let state = budgetReducer(initialBudget(), { type: 'SET_PAYMENT_SCHEDULE', schedule: { first: 15, second: 'last' } });
  state = budgetReducer(state, { type: 'SET_ANNUAL_BONUS', bonus: { year: 2026, date: '2026-12-15', amountCents: 20000 } });
  assert.deepEqual(migrateBudget(JSON.parse(JSON.stringify(state))), state);
  assert.equal(isBudgetState({ ...state, nextPaymentDate: '2026-02-29' }), false);
  assert.equal(isBudgetState({ ...state, annualBonuses: [...state.annualBonuses, ...state.annualBonuses] }), false);
  assert.equal(isBudgetState({ ...state, annualBonuses: undefined }), false);
  assert.throws(() => migrateBudget({ ...state, version: 99 }));
});


test('Pagos: sábado y domingo pasan al viernes y lunes permanece intacto', () => {
  assert.equal(adjustPaymentDate('2026-08-15'), '2026-08-14');
  assert.equal(adjustPaymentDate('2026-11-15'), '2026-11-13');
  assert.equal(adjustPaymentDate('2026-06-15'), '2026-06-15');
  assert.equal(adjustPaymentDate('2026-02-01'), '2026-01-30');
});

test('Pagos mensuales: 15 y fin de mes, febrero y años bisiestos', () => {
  const schedule = { first: 15, second: 'last' as const };
  assert.deepEqual(paymentsForMonth(schedule, '2026-10-01').map(p => [p.nominalDate, p.paymentDate]), [
    ['2026-10-15', '2026-10-15'], ['2026-10-31', '2026-10-30'],
  ]);
  assert.deepEqual(paymentsForMonth(schedule, '2026-02-01').map(p => p.paymentDate), ['2026-02-13', '2026-02-27']);
  assert.deepEqual(paymentsForMonth(schedule, '2024-02-01').map(p => p.nominalDate), ['2024-02-15', '2024-02-29']);
  for (const second of [29, 30, 31]) {
    assert.equal(paymentsForMonth({ first: 15, second }, '2026-02-01')[1].paymentDate, '2026-02-27');
  }
});

test('Próximos pagos: incluye hoy, omite pagos pasados y cruza el año', () => {
  const schedule = { first: 15, second: 'last' as const };
  assert.deepEqual(upcomingPayments(schedule, '2026-11-13', 3).map(p => p.paymentDate), ['2026-11-13', '2026-11-30', '2026-12-15']);
  assert.deepEqual(upcomingPayments(schedule, '2026-11-14', 2).map(p => p.paymentDate), ['2026-11-30', '2026-12-15']);
  assert.deepEqual(upcomingPayments(schedule, '2026-12-31', 3).map(p => p.paymentDate), ['2026-12-31', '2027-01-15', '2027-01-29']);
  assert.deepEqual(upcomingPayments(schedule, '2027-01-01', 2).map(p => p.paymentDate), ['2027-01-15', '2027-01-29']);
  assert.deepEqual(upcomingPayments(schedule, '2100-12-31', 2).map(p => p.paymentDate), ['2100-12-31']);
  assert.deepEqual(upcomingPayments(null, '2026-10-10'), []);
});

test('Pago del día 1: se incluye aunque caiga en el mes anterior', () => {
  const schedule = { first: 1, second: 15 };
  assert.deepEqual(upcomingPayments(schedule, '2026-01-16', 2).map(p => p.paymentDate), ['2026-01-30', '2026-02-13']);
  assert.ok(calendarPayments(schedule, '2026-01-01').some(p => p.nominalDate === '2026-02-01' && p.paymentDate === '2026-01-30'));
});

test('Dos fechas: rechaza coincidencias en meses cortos o fines de semana', () => {
  for (const schedule of [
    { first: 15, second: 15 }, { first: 16, second: 15 }, { first: 0, second: 30 },
    { first: 15, second: 32 }, { first: 15.5, second: 30 }, { first: 27, second: 'last' },
    { first: 1, second: 'last' }, { first: 1, second: 2 }, { first: 30, second: 31 },
  ]) assert.equal(isValidPaymentSchedule(schedule), false, JSON.stringify(schedule));
  for (const schedule of [{ first: 15, second: 'last' }, { first: 15, second: 30 }, { first: 1, second: 15 }]) {
    assert.ok(isValidPaymentSchedule(schedule));
  }
});

test('Calendario: siempre dos cobros únicos por mes durante 2010–2035', () => {
  for (const schedule of [{ first: 15, second: 'last' as const }, { first: 15, second: 30 }, { first: 1, second: 15 }]) {
    let previous = '';
    for (let year = 2010; year <= 2035; year++) {
      for (let month = 1; month <= 12; month++) {
        const payments = paymentsForMonth(schedule, `${year}-${String(month).padStart(2, '0')}-01`);
        assert.equal(payments.length, 2);
        for (const payment of payments) {
          assert.ok(payment.paymentDate > previous);
          assert.ok(![0, 6].includes(localDate(payment.paymentDate).getDay()));
          previous = payment.paymentDate;
        }
      }
    }
  }
});

test('Migración de versión 2: conserva fecha única, aguinaldo y gastos', () => {
  const { paymentSchedule, ...common } = initialBudget();
  const old = { ...common, version: 2, nextPaymentDate: '2026-11-15', expenses,
    annualBonuses: [{ year: 2025, date: '2025-12-15', amountCents: 25000 }] };
  const migrated = migrateBudget(old);
  assert.equal(migrated.version, 9);
  assert.equal(migrated.paymentSchedule, null);
  assert.equal(migrated.nextPaymentDate, old.nextPaymentDate);
  assert.deepEqual(migrated.annualBonuses, old.annualBonuses);
  assert.deepEqual(migrated.expenses, expenses);
  assert.equal(isBudgetState({ ...migrated, paymentSchedule: { first: 30, second: 31 } }), false);
  assert.equal(isBudgetState({ ...migrated, paymentSchedule: undefined }), false);
});
