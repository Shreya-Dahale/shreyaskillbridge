import type { Timeline } from "@/lib/profile/timeline";
import { cn } from "@/lib/utils";

/** Roles and breaks on one time axis. A break uses a plain neutral bar, never a warning colour. */
export function CareerTimeline({ timeline }: { timeline: Timeline }) {
  return (
    <div className="space-y-2">
      <ul className="space-y-3">
        {timeline.bars.map((bar, i) => (
          <li key={`${bar.label}-${i}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs">
              <span className="font-medium">{bar.label}</span>
              <span className="text-muted-foreground">{bar.dates}</span>
            </div>
            <div aria-hidden="true" className="relative mt-1 h-3 rounded-full bg-muted">
              <div
                className={cn(
                  "absolute inset-y-0 rounded-full",
                  bar.kind === "role" ? "bg-primary" : "border border-dashed border-muted-foreground/60 bg-muted-foreground/25"
                )}
                style={{ left: `${bar.leftPct}%`, width: `${bar.widthPct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {timeline.ticks.length > 0 && (
        <div aria-hidden="true" className="relative h-4 text-[10px] text-muted-foreground">
          {timeline.ticks.map((tick) => (
            <span
              key={tick.label}
              className="absolute -translate-x-1/2"
              style={{ left: `${tick.leftPct}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}