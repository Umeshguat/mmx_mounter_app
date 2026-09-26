// Capitalizes only the first character, leaving the rest of the string
// untouched (unlike CSS textTransform: 'capitalize', which title-cases
// every word) — used for values like campaign_name that come back from the
// backend in arbitrary casing (e.g. "order date").
export function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
