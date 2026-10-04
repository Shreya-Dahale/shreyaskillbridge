/** Counts how often each name appears, most common first, ties in alphabetical order. */
export function topCounts(names: string[], limit: number): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const name of names) map.set(name, (map.get(name) ?? 0) + 1);

  return Array.from(map, ([name, count]) => ({ name, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const x = a.name.toLowerCase();
      const y = b.name.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    })
    .slice(0, limit);
}