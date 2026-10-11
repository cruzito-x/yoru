import { test } from "node:test";
import assert from "node:assert/strict";
import { initialBudget } from "../src/data/defaults";
import { budgetReducer } from "../src/context/budgetReducer";
import {
  bonusInRange,
  categoryTotals,
  expensesInRange,
  groupByDay,
  salaryAt,
  totalExpenses,
} from "../src/utils/budget";
import {
  calendarDays,
  dateKey,
  fortnight,
  historyRange,
  isDecember,
  isValidDate,
  localDate,
  moveFortnight,
  movePeriod,
} from "../src/utils/dates";
import { isBudgetState, migrateBudget } from "../src/utils/budgetSchema";
import { parseMoney, percentage } from "../src/utils/money";
import {
  adjustPaymentDate,
  calendarPayments,
  isValidPaymentSchedule,
  paymentsForMonth,
  upcomingPayments,
} from "../src/utils/payments";
import type { Expense } from "../src/types/budget";

test("Importes: admite punto/coma y conserva centavos exactos", () => {
  assert.equal(parseMoney("2.25"), 225);
  assert.equal(parseMoney("0,65"), 65);
  assert.equal(parseMoney(" 38 "), 3800);
  assert.equal(parseMoney("1.2"), 120);
  assert.equal(parseMoney("0"), 0);
  assert.equal(parseMoney("999999.99"), 99999999);
  assert.equal(parseMoney("0.10")! + parseMoney("0.20")!, 30);
});

test("Importes: rechaza negativos, notación científica y decimales inválidos", () => {
  for (const invalid of [
    "",
    "-2",
    "NaN",
    "1e3",
    "1.234",
    "3,2.1",
    "1,000.50",
    "1000000",
    ".50",
  ]) {
    assert.equal(parseMoney(invalid), null, invalid);
  }
});

test("Porcentajes: sin división por cero y con déficit visible", () => {
  assert.equal(percentage(15000, 30000), 50);
  assert.ok(Math.abs(percentage(33000, 30000) - 110) < 1e-10);
  assert.equal(percentage(0, 0), 0);
});

test("Fechas locales: valida meses, bisiestos y formato", () => {
  for (const valid of ["2024-02-29", "2026-10-31", "1900-01-01", "2100-12-31"])
    assert.ok(isValidDate(valid), valid);
  for (const invalid of [
    "2026-02-29",
    "2026-04-31",
    "2026-00-10",
    "2026-13-01",
    "2026-1-01",
    "1899-01-01",
    "texto",
  ]) {
    assert.equal(isValidDate(invalid), false, invalid);
  }
  assert.equal(dateKey(new Date(2026, 9, 15, 0, 0)), "2026-10-15");
});

test("Quincenas: separa el día 14 del 15 y contempla el final de febrero", () => {
  assert.deepEqual(fortnight("2026-10-14"), {
    start: "2026-10-01",
    end: "2026-10-14",
  });
  assert.deepEqual(fortnight("2026-10-15"), {
    start: "2026-10-15",
    end: "2026-10-31",
  });
  assert.deepEqual(fortnight("2024-02-29"), {
    start: "2024-02-15",
    end: "2024-02-29",
  });
  assert.deepEqual(fortnight("2026-02-28"), {
    start: "2026-02-15",
    end: "2026-02-28",
  });
});

test("Navegación de quincenas: atraviesa meses y años", () => {
  assert.equal(moveFortnight("2026-10-20", -1), "2026-10-01");
  assert.equal(moveFortnight("2026-10-20", 1), "2026-11-01");
  assert.equal(moveFortnight("2026-01-05", -1), "2025-12-15");
  assert.equal(moveFortnight("2026-12-25", 1), "2027-01-01");
});

test("Historial: semana de lunes a domingo, incluso cruzando el año", () => {
  assert.deepEqual(historyRange("day", "2026-10-10"), {
    start: "2026-10-10",
    end: "2026-10-10",
  });
  assert.deepEqual(historyRange("week", "2026-10-11"), {
    start: "2026-10-05",
    end: "2026-10-11",
  });
  assert.deepEqual(historyRange("week", "2027-01-01"), {
    start: "2026-12-28",
    end: "2027-01-03",
  });
  assert.deepEqual(historyRange("month", "2024-02-29"), {
    start: "2024-02-01",
    end: "2024-02-29",
  });
  assert.deepEqual(historyRange("year", "2026-10-10"), {
    start: "2026-01-01",
    end: "2026-12-31",
  });
});

test("Navegación: el 31 de enero no se salta febrero", () => {
  assert.equal(movePeriod("month", "2026-01-31", 1), "2026-02-01");
  assert.equal(movePeriod("month", "2026-12-31", 1), "2027-01-01");
  assert.equal(movePeriod("year", "2024-02-29", 1), "2025-01-01");
  assert.equal(movePeriod("week", "2026-10-10", -1), "2026-10-03");
});

const expenses: Expense[] = [
  {
    id: "1",
    name: "Desayuno",
    amountCents: 100,
    categoryId: "food",
    date: "2026-10-14",
    note: "",
  },
  {
    id: "2",
    name: "Almuerzo",
    amountCents: 290,
    categoryId: "food",
    date: "2026-10-15",
    note: "",
  },
  {
    id: "3",
    name: "Pasaje",
    amountCents: 60,
    categoryId: "transport",
    date: "2026-10-31",
    note: "",
  },
  {
    id: "4",
    name: "Internet",
    amountCents: 3000,
    categoryId: "services",
    date: "2026-11-01",
    note: "",
  },
];

test("Gastos: incluye los límites del período y excluye otras quincenas", () => {
  const selected = expensesInRange(expenses, fortnight("2026-10-15"));
  assert.deepEqual(
    selected.map((e) => e.id),
    ["3", "2"],
  );
  assert.equal(totalExpenses(selected), 350);
  assert.equal(
    categoryTotals(initialBudget().categories, selected).find(
      (c) => c.id === "food",
    )?.total,
    290,
  );
  assert.deepEqual(
    groupByDay(selected).map((g) => g.date),
    ["2026-10-31", "2026-10-15"],
  );
  assert.equal(totalExpenses([]), 0);
});

test("Reducer: crear y editar gastos no duplica filas y no muta el original", () => {
  const original = initialBudget();
  const added = budgetReducer(original, {
    type: "SAVE_EXPENSE",
    expense: expenses[0],
  });
  assert.equal(original.expenses.length, 0);
  const edited = budgetReducer(added, {
    type: "SAVE_EXPENSE",
    expense: { ...expenses[0], amountCents: 200 },
  });
  assert.equal(edited.expenses.length, 1);
  assert.equal(edited.expenses[0].amountCents, 200);
  assert.equal(added.expenses[0].amountCents, 100);
  assert.equal(
    budgetReducer(edited, { type: "DELETE_EXPENSE", id: "1" }).expenses.length,
    0,
  );
});

test("Reducer: conserva categorías usadas y rechaza categorías inexistentes", () => {
  const original = initialBudget();
  const added = budgetReducer(original, {
    type: "SAVE_EXPENSE",
    expense: expenses[0],
  });
  assert.equal(
    budgetReducer(added, { type: "DELETE_CATEGORY", id: "food" }),
    added,
  );
  assert.equal(
    budgetReducer(original, {
      type: "SAVE_EXPENSE",
      expense: { ...expenses[0], categoryId: "missing" },
    }),
    original,
  );
  assert.equal(
    budgetReducer(original, { type: "DELETE_CATEGORY", id: "food" }).categories
      .length,
    3,
  );
});

test("Reducer: actualiza una categoría conservando sus gastos", () => {
  const added = budgetReducer(initialBudget(), {
    type: "SAVE_EXPENSE",
    expense: expenses[0],
  });
  const edited = budgetReducer(added, {
    type: "SAVE_CATEGORY",
    category: { id: "food", name: "Comidas", color: "#C56839" },
  });
  assert.equal(edited.categories.length, 4);
  assert.equal(edited.categories[0].name, "Comidas");
  assert.equal(edited.expenses[0].categoryId, "food");
});

test("Sueldo: cambiarlo conserva períodos anteriores y se aplica a los siguientes", () => {
  const original = initialBudget();
  const increased = budgetReducer(original, {
    type: "SET_SALARY",
    entry: { from: "2026-10-15", amountCents: 35000 },
  });
  assert.equal(salaryAt(increased.salaryHistory, "2026-10-01"), 30000);
  assert.equal(salaryAt(increased.salaryHistory, "2026-10-15"), 35000);
  assert.equal(salaryAt(increased.salaryHistory, "2027-01-01"), 35000);
  const corrected = budgetReducer(increased, {
    type: "SET_SALARY",
    entry: { from: "2026-10-15", amountCents: 32500 },
  });
  assert.equal(corrected.salaryHistory.length, 2);
  assert.equal(salaryAt(corrected.salaryHistory, "2026-10-15"), 32500);
});

test("Tema: persiste como dato global y admite serialización completa", () => {
  const changed = budgetReducer(initialBudget(), {
    type: "SET_THEME",
    mode: "dark",
  });
  assert.equal(changed.themeMode, "dark");
  assert.deepEqual(JSON.parse(JSON.stringify(changed)), changed);
});

test("Calendario: semanas completas de lunes a domingo y febrero bisiesto", () => {
  for (const month of [
    "2024-02-01",
    "2026-02-01",
    "2026-10-01",
    "2026-12-01",
  ]) {
    const days = calendarDays(month);
    assert.equal(days.length % 7, 0);
    assert.equal(localDate(days[0]).getDay(), 1);
    assert.equal(localDate(days.at(-1)!).getDay(), 0);
    assert.ok(days.every(isValidDate));
    assert.equal(new Set(days).size, days.length);
  }
  assert.ok(calendarDays("2024-02-01").includes("2024-02-29"));
  assert.ok(!calendarDays("2026-02-01").includes("2026-02-29"));
});

test("Aguinaldo: solo se habilita en fechas válidas de diciembre", () => {
  assert.equal(isDecember("2026-12-01"), true);
  assert.equal(isDecember("2026-12-31"), true);
  for (const date of ["2026-10-10", "2026-11-30", "2027-01-01", "2026-12-32"])
    assert.equal(isDecember(date), false);
});

test("Calendario recurrente: guarda dos reglas, desactiva y rechaza colisiones", () => {
  const original = { ...initialBudget(), nextPaymentDate: "2026-10-15" };
  const selected = budgetReducer(original, {
    type: "SET_PAYMENT_SCHEDULE",
    schedule: { first: 15, second: "last" },
  });
  assert.deepEqual(selected.paymentSchedule, { first: 15, second: "last" });
  assert.equal(selected.nextPaymentDate, null);
  assert.equal(original.paymentSchedule, null);
  assert.equal(
    budgetReducer(selected, {
      type: "SET_PAYMENT_SCHEDULE",
      schedule: { first: 30, second: 31 },
    }),
    selected,
  );
  assert.equal(
    budgetReducer(selected, { type: "SET_PAYMENT_SCHEDULE", schedule: null })
      .paymentSchedule,
    null,
  );
});

test("Aguinaldo: editar reemplaza el monto del año y conserva años anteriores", () => {
  const first = budgetReducer(initialBudget(), {
    type: "SET_ANNUAL_BONUS",
    bonus: { year: 2025, date: "2025-12-15", amountCents: 15000 },
  });
  const second = budgetReducer(first, {
    type: "SET_ANNUAL_BONUS",
    bonus: { year: 2026, date: "2026-12-15", amountCents: 20000 },
  });
  const edited = budgetReducer(second, {
    type: "SET_ANNUAL_BONUS",
    bonus: { year: 2026, date: "2026-12-20", amountCents: 25000 },
  });
  assert.equal(edited.annualBonuses.length, 2);
  assert.equal(
    edited.annualBonuses.find((b) => b.year === 2026)?.amountCents,
    25000,
  );
  assert.equal(
    edited.annualBonuses.find((b) => b.year === 2025)?.amountCents,
    15000,
  );
  assert.equal(
    second.annualBonuses.find((b) => b.year === 2026)?.amountCents,
    20000,
  );
});

test("Aguinaldo: rechaza otros meses, otro año y montos negativos", () => {
  const state = initialBudget();
  for (const bonus of [
    { year: 2026, date: "2026-11-15", amountCents: 20000 },
    { year: 2027, date: "2026-12-15", amountCents: 20000 },
    { year: 2026, date: "2026-12-15", amountCents: -100 },
    { year: 2026, date: "2026-12-15", amountCents: 100.5 },
  ])
    assert.equal(
      budgetReducer(state, { type: "SET_ANNUAL_BONUS", bonus }),
      state,
    );
});

test("Aguinaldo: solo aumenta el saldo de la quincena de su fecha", () => {
  const state = budgetReducer(initialBudget(), {
    type: "SET_ANNUAL_BONUS",
    bonus: { year: 2026, date: "2026-12-15", amountCents: 20000 },
  });
  assert.equal(bonusInRange(state.annualBonuses, fortnight("2026-12-14")), 0);
  assert.equal(
    bonusInRange(state.annualBonuses, fortnight("2026-12-15")),
    20000,
  );
  assert.equal(bonusInRange(state.annualBonuses, fortnight("2027-01-01")), 0);
  const removed = budgetReducer(state, {
    type: "SET_ANNUAL_BONUS",
    bonus: { year: 2026, date: "2026-12-15", amountCents: 0 },
  });
  assert.equal(bonusInRange(removed.annualBonuses, fortnight("2026-12-15")), 0);
});

test("Migración: los datos de la versión 1 conservan gastos, sueldo y tema", () => {
  const original = { ...initialBudget(), expenses, themeMode: "dark" as const };
  const { nextPaymentDate, annualBonuses, paymentSchedule, ...common } =
    original;
  const legacy = { ...common, version: 1 };
  const migrated = migrateBudget(JSON.parse(JSON.stringify(legacy)));
  assert.equal(migrated.version, 3);
  assert.deepEqual(migrated.expenses, expenses);
  assert.deepEqual(migrated.categories, original.categories);
  assert.deepEqual(migrated.salaryHistory, original.salaryHistory);
  assert.equal(migrated.themeMode, "dark");
  assert.equal(migrated.nextPaymentDate, null);
  assert.deepEqual(migrated.annualBonuses, []);
  assert.equal(legacy.version, 1);
});

test("Persistencia: valida pago y aguinaldo y rechaza datos incompletos", () => {
  let state = budgetReducer(initialBudget(), {
    type: "SET_PAYMENT_SCHEDULE",
    schedule: { first: 15, second: "last" },
  });
  state = budgetReducer(state, {
    type: "SET_ANNUAL_BONUS",
    bonus: { year: 2026, date: "2026-12-15", amountCents: 20000 },
  });
  assert.deepEqual(migrateBudget(JSON.parse(JSON.stringify(state))), state);
  assert.equal(
    isBudgetState({ ...state, nextPaymentDate: "2026-02-29" }),
    false,
  );
  assert.equal(
    isBudgetState({
      ...state,
      annualBonuses: [...state.annualBonuses, ...state.annualBonuses],
    }),
    false,
  );
  assert.equal(isBudgetState({ ...state, annualBonuses: undefined }), false);
  assert.throws(() => migrateBudget({ ...state, version: 99 }));
});

test("Pagos: sábado y domingo pasan al viernes y lunes permanece intacto", () => {
  assert.equal(adjustPaymentDate("2026-08-15"), "2026-08-14");
  assert.equal(adjustPaymentDate("2026-11-15"), "2026-11-13");
  assert.equal(adjustPaymentDate("2026-06-15"), "2026-06-15");
  assert.equal(adjustPaymentDate("2026-02-01"), "2026-01-30");
});

test("Pagos mensuales: 15 y fin de mes, febrero y años bisiestos", () => {
  const schedule = { first: 15, second: "last" as const };
  assert.deepEqual(
    paymentsForMonth(schedule, "2026-10-01").map((p) => [
      p.nominalDate,
      p.paymentDate,
    ]),
    [
      ["2026-10-15", "2026-10-15"],
      ["2026-10-31", "2026-10-30"],
    ],
  );
  assert.deepEqual(
    paymentsForMonth(schedule, "2026-02-01").map((p) => p.paymentDate),
    ["2026-02-13", "2026-02-27"],
  );
  assert.deepEqual(
    paymentsForMonth(schedule, "2024-02-01").map((p) => p.nominalDate),
    ["2024-02-15", "2024-02-29"],
  );
  for (const second of [29, 30, 31]) {
    assert.equal(
      paymentsForMonth({ first: 15, second }, "2026-02-01")[1].paymentDate,
      "2026-02-27",
    );
  }
});

test("Próximos pagos: incluye hoy, omite pagos pasados y cruza el año", () => {
  const schedule = { first: 15, second: "last" as const };
  assert.deepEqual(
    upcomingPayments(schedule, "2026-11-13", 3).map((p) => p.paymentDate),
    ["2026-11-13", "2026-11-30", "2026-12-15"],
  );
  assert.deepEqual(
    upcomingPayments(schedule, "2026-11-14", 2).map((p) => p.paymentDate),
    ["2026-11-30", "2026-12-15"],
  );
  assert.deepEqual(
    upcomingPayments(schedule, "2026-12-31", 3).map((p) => p.paymentDate),
    ["2026-12-31", "2027-01-15", "2027-01-29"],
  );
  assert.deepEqual(
    upcomingPayments(schedule, "2027-01-01", 2).map((p) => p.paymentDate),
    ["2027-01-15", "2027-01-29"],
  );
  assert.deepEqual(
    upcomingPayments(schedule, "2100-12-31", 2).map((p) => p.paymentDate),
    ["2100-12-31"],
  );
  assert.deepEqual(upcomingPayments(null, "2026-10-10"), []);
});

test("Pago del día 1: se incluye aunque caiga en el mes anterior", () => {
  const schedule = { first: 1, second: 15 };
  assert.deepEqual(
    upcomingPayments(schedule, "2026-01-16", 2).map((p) => p.paymentDate),
    ["2026-01-30", "2026-02-13"],
  );
  assert.ok(
    calendarPayments(schedule, "2026-01-01").some(
      (p) => p.nominalDate === "2026-02-01" && p.paymentDate === "2026-01-30",
    ),
  );
});

test("Dos fechas: rechaza coincidencias en meses cortos o fines de semana", () => {
  for (const schedule of [
    { first: 15, second: 15 },
    { first: 16, second: 15 },
    { first: 0, second: 30 },
    { first: 15, second: 32 },
    { first: 15.5, second: 30 },
    { first: 27, second: "last" },
    { first: 1, second: "last" },
    { first: 1, second: 2 },
    { first: 30, second: 31 },
  ])
    assert.equal(
      isValidPaymentSchedule(schedule),
      false,
      JSON.stringify(schedule),
    );
  for (const schedule of [
    { first: 15, second: "last" },
    { first: 15, second: 30 },
    { first: 1, second: 15 },
  ]) {
    assert.ok(isValidPaymentSchedule(schedule));
  }
});

test("Calendario: siempre dos cobros únicos por mes durante 2010–2035", () => {
  for (const schedule of [
    { first: 15, second: "last" as const },
    { first: 15, second: 30 },
    { first: 1, second: 15 },
  ]) {
    let previous = "";
    for (let year = 2010; year <= 2035; year++) {
      for (let month = 1; month <= 12; month++) {
        const payments = paymentsForMonth(
          schedule,
          `${year}-${String(month).padStart(2, "0")}-01`,
        );
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

test("Migración de versión 2: conserva fecha única, aguinaldo y gastos", () => {
  const { paymentSchedule, ...common } = initialBudget();
  const old = {
    ...common,
    version: 2,
    nextPaymentDate: "2026-11-15",
    expenses,
    annualBonuses: [{ year: 2025, date: "2025-12-15", amountCents: 25000 }],
  };
  const migrated = migrateBudget(old);
  assert.equal(migrated.version, 3);
  assert.equal(migrated.paymentSchedule, null);
  assert.equal(migrated.nextPaymentDate, old.nextPaymentDate);
  assert.deepEqual(migrated.annualBonuses, old.annualBonuses);
  assert.deepEqual(migrated.expenses, expenses);
  assert.equal(
    isBudgetState({ ...migrated, paymentSchedule: { first: 30, second: 31 } }),
    false,
  );
  assert.equal(
    isBudgetState({ ...migrated, paymentSchedule: undefined }),
    false,
  );
});
