/**
 * Format large numbers with K/M suffixes
 * Examples: "1.2K plays", "45 likes", "3.4M plays"
 */
export function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}
