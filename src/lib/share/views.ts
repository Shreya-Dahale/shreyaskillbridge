const DAY_MS = 24 * 60 * 60 * 1000;

export type DayBucket = { date: string; count: number }; // date is "YYYY-MM-DD" in UTC

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** One bucket per day for the last `days` days, oldest first, including days with no views. */
export function bucketViewsByDay(viewedAt: Date[], days: number, now: Date = new Date()): DayBucket[] {
  const todayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const buckets: DayBucket[] = [];
  const index = new Map<string, number>();

  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(new Date(todayStart - i * DAY_MS));
    index.set(key, buckets.length);
    buckets.push({ date: key, count: 0 });
  }

  for (const d of viewedAt) {
    const i = index.get(dayKey(d));
    if (i !== undefined) buckets[i].count++;
  }
  return buckets;
}

export function viewerLabel(viewerCompany: string | null): string {
  return viewerCompany ?? "A visitor without an account";
}

export function summarizeViews(views: { viewerCompany: string | null }[]) {
  const companies = new Set<string>();
  let anonymous = 0;
  for (const v of views) {
    if (v.viewerCompany) companies.add(v.viewerCompany);
    else anonymous++;
  }
  return {
    total: views.length,
    anonymous,
    companies: Array.from(companies).sort((a, b) => {
      const x = a.toLowerCase();
      const y = b.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    }),
  };
}