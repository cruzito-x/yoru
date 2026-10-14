import { PayrollSettings } from '../types/budget';

const isPayrollSalary = (value: unknown): value is number => Number.isSafeInteger(value)
  && Number(value) > 0 && Number(value) <= 99999999;

export function isValidPayrollSettings(value: unknown): value is PayrollSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as PayrollSettings;
  return isPayrollSalary(settings.monthlySalaryCents) && Number.isInteger(settings.serviceMonths)
    && settings.serviceMonths >= 12 && settings.serviceMonths <= 1200
    && Number.isSafeInteger(settings.travelAllowanceCents) && settings.travelAllowanceCents >= 0
    && settings.travelAllowanceCents <= 99999999;
}

export interface FortnightPayrollBreakdown {
  grossCents: number;
  afpCents: number;
  isssCents: number;
  incomeTaxCents: number;
  netCents: number;
}

function roundHalfEven(value: number): number {
  const lower = Math.floor(value);
  const fraction = value - lower;
  if (fraction < 0.5) return lower;
  if (fraction > 0.5) return lower + 1;
  return lower % 2 === 0 ? lower : lower + 1;
}

// Retención quincenal estimada desde la tabla mensual vigente; el empleador
// puede ajustar centavos por redondeos y recálculos semestrales.
export function calculateFortnightPayroll(monthlySalaryCents: number): FortnightPayrollBreakdown {
  if (!isPayrollSalary(monthlySalaryCents)) throw new RangeError('Ingresa un sueldo en planilla válido.');
  const grossCents = Math.round(monthlySalaryCents / 2);
  const afpCents = roundHalfEven(monthlySalaryCents * 29 / 400 / 2);
  const monthlyIsssBase = Math.min(monthlySalaryCents, 100000);
  const monthlyIsssCents = Math.round(monthlyIsssBase * 0.03);
  const isssCents = roundHalfEven(monthlyIsssCents / 2);
  const taxableMonthlyCents = Math.max(0, monthlySalaryCents - Math.round(monthlySalaryCents * 29 / 400)
    - monthlyIsssCents);
  let monthlyTaxCents = 0;
  if (taxableMonthlyCents > 55000 && taxableMonthlyCents <= 89524) {
    monthlyTaxCents = 1767 + Math.round((taxableMonthlyCents - 55000) * 0.1);
  } else if (taxableMonthlyCents > 89524 && taxableMonthlyCents <= 203810) {
    monthlyTaxCents = 6000 + Math.round((taxableMonthlyCents - 89524) * 0.2);
  } else if (taxableMonthlyCents > 203810) {
    monthlyTaxCents = 28857 + Math.round((taxableMonthlyCents - 203810) * 0.3);
  }
  const incomeTaxCents = roundHalfEven(monthlyTaxCents / 2);
  return { grossCents, afpCents, isssCents, incomeTaxCents,
    netCents: grossCents - afpCents - isssCents - incomeTaxCents };
}

// Las tres reglas solicitadas empiezan al cumplir un año de servicio.
export function annualBonusSalaryDays(serviceMonths: number): 15 | 19 | 21 {
  if (!Number.isInteger(serviceMonths) || serviceMonths < 12 || serviceMonths > 1200) {
    throw new RangeError('La antigüedad debe estar entre 1 y 100 años completos.');
  }
  return serviceMonths < 36 ? 15 : serviceMonths < 120 ? 19 : 21;
}

export function calculateAnnualBonus(settings: Pick<PayrollSettings, 'monthlySalaryCents' | 'serviceMonths'>): number {
  if (!isPayrollSalary(settings.monthlySalaryCents) || !Number.isInteger(settings.serviceMonths)
    || settings.serviceMonths < 12 || settings.serviceMonths > 1200) {
    throw new RangeError('Revisa el sueldo y la antigüedad de la planilla.');
  }
  // Redondear sólo el resultado: redondear antes el salario diario perdería centavos.
  return Math.round(settings.monthlySalaryCents * annualBonusSalaryDays(settings.serviceMonths) / 30);
}

export function calculateQuincena25(monthlySalaryCents: number): number {
  if (!isPayrollSalary(monthlySalaryCents)) throw new RangeError('Ingresa un sueldo en planilla válido.');
  return Math.round(monthlySalaryCents / 2);
}
