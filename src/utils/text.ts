export function truncateWithEllipsis(value: string, maxLength = 28): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}
