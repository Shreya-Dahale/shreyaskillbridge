import { formatDate } from "@/lib/profile/format";
import type { DayBucket } from "@/lib/share/views";

const asDate = (key: string) => new Date(`${key}T00:00:00Z`);

/** Daily view counts as simple bars. It shows counts only. */
export function ViewsChart({ data }: { data: DayBucket[] }) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <figure className="space-y-2">
      <div
        role="img"
        aria-label={`Views per day for the last ${data.length} days: ${total} in total`}
        className="flex h-32 items-end gap-1"
      >
        {data.map((d) => (
          <div
            key={d.date}
            title={`${formatDate(asDate(d.date))}: ${d.count} ${d.count === 1 ? "view" : "views"}`}
            className="flex h-full flex-1 items-end"
          >
            <div
              className={d.count > 0 ? "w-full rounded-t bg-blue-500" : "w-full rounded-t bg-gray-100"}
              style={{ height: d.count > 0 ? `${Math.max((d.count / max) * 100, 6)}%` : "4%" }}
            />
          </div>
        ))}
      </div>
      <figcaption className="flex justify-between text-xs text-gray-500">
        <span>{formatDate(asDate(data[0].date))}</span>
        <span>Most views in a day: {max === 1 && total === 0 ? 0 : max}</span>
        <span>{formatDate(asDate(data[data.length - 1].date))}</span>
      </figcaption>
    </figure>
  );
}