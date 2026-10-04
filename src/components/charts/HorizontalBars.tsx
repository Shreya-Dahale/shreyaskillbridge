/** A ranked list of counts as horizontal bars. It shows counts only, never a score. */
export function HorizontalBars({ rows, label }: { rows: { label: string; count: number }[]; label: string }) {
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <ul aria-label={label} className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate" title={r.label}>
            {r.label}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
          <span className="w-6 text-right text-xs text-muted-foreground">{r.count}</span>
        </li>
      ))}
    </ul>
  );
}