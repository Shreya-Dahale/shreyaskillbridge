import { formatDate } from "@/lib/profile/format";
import type { DayBucket } from "@/lib/share/views";

const asDate = (key: string) => new Date(`${key}T00:00:00Z`);

/** Daily counts as simple bars. `noun` is the singular name of what is counted. It shows counts only. */
export function ViewsChart({ data, noun = "view" }: { data: DayBucket[]; noun?: string }) {
  if (data.length === 0) return null;

  const plural = `${noun}s`;
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const peak = Math.max(...data.map((d) => d.count), 0);
  const scale = Math.max(peak, 1);

  return (
    <figure className="space-y-2">
      <div
        role="img"
        aria-label={`${plural} per day for the last ${data.length} days: ${total} in total`}
        className="flex h-32 items-end gap-1"
      >
        {data.map((d) => (
          <div
            key={d.date}
            title={`${formatDate(asDate(d.date))}: ${d.count} ${d.count === 1 ? noun : plural}`}
            className="flex h-full flex-1 items-end"
          >
            <div
              className={d.count > 0 ? "w-full rounded-t bg-primary" : "w-full rounded-t bg-muted"}
              style={{ height: d.count > 0 ? `${Math.max((d.count / scale) * 100, 6)}%` : "4%" }}
            />
          </div>
        ))}
      </div>
      <figcaption className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(asDate(data[0].date))}</span>
        <span>
          Most {plural} in a day: {peak}
        </span>
        <span>{formatDate(asDate(data[data.length - 1].date))}</span>
      </figcaption>
    </figure>
  );
}