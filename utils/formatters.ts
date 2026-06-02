export function formatUzPhone(raw: string): string {
  const d = raw.slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2, 5)}`;
  if (d.length <= 7)
    return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`;
}
