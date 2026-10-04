import { STATUS_LABEL } from "@/lib/skills/describe";
import type { SkillStatus } from "@/lib/skills/gap-engine";

const ORDER: SkillStatus[] = ["DEMONSTRATED", "DEVELOPING", "NEEDS_REFRESH", "NOT_YET_DEMONSTRATED"];

const BAR_COLOR: Record<SkillStatus, string> = {
  DEMONSTRATED: "bg-green-500",
  DEVELOPING: "bg-blue-500",
  NEEDS_REFRESH: "bg-amber-400",
  NOT_YET_DEMONSTRATED: "bg-gray-300",
};

/** A segmented bar of skill counts per status. It shows counts only, never a score. */
export function StatusBar({ statuses }: { statuses: SkillStatus[] }) {
  const total = statuses.length;
  if (total === 0) return null;

  const counts = ORDER.map((status) => ({
    status,
    n: statuses.filter((s) => s === status).length,
  })).filter((c) => c.n > 0);

  const summary = counts.map((c) => `${c.n} ${STATUS_LABEL[c.status].toLowerCase()}`).join(", ");

  return (
    <div className="space-y-2">
      <div
        role="img"
        aria-label={`Skills by status: ${summary}`}
        className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100"
      >
        {counts.map((c) => (
          <div
            key={c.status}
            className={BAR_COLOR[c.status]}
            style={{ width: `${(c.n / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        {counts.map((c) => (
          <li key={c.status} className="flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-full ${BAR_COLOR[c.status]}`} />
            {c.n} {STATUS_LABEL[c.status].toLowerCase()}
          </li>
        ))}
      </ul>
    </div>
  );
}