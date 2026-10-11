// Guardamos centavos enteros: 0.10 + 0.20 nunca pierde precisión.
export function parseMoney(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, decimals = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
}

export function money(cents: number): string {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function moneyInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function percentage(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}
