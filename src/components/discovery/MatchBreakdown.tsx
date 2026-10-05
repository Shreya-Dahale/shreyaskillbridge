import { AlertCircle, CheckCircle2, Circle, CircleDot } from "lucide-react";
import { noteLabels } from "@/lib/discovery/describe";
import type { MatchMark, MatchRow } from "@/lib/discovery/match";

function MarkIcon({ mark }: { mark: MatchMark }) {
  switch (mark) {
    case "TICK":
      return <CheckCircle2 aria-label="Recently demonstrated" className="mt-0.5 size-4 shrink-0 text-green-600" />;
    case "PROGRESS":
      return <CircleDot aria-label="Practice started" className="mt-0.5 size-4 shrink-0 text-blue-600" />;
    case "WARN":
      return <AlertCircle aria-label="No recent evidence" className="mt-0.5 size-4 shrink-0 text-amber-600" />;
    case "EMPTY":
      return <Circle aria-label="Nothing shown" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />;
  }
}

/** The tick-and-warning breakdown: one line per skill the job asks for, with the reason. */
export function MatchBreakdown({ rows }: { rows: MatchRow[] }) {
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => {
        const notes = noteLabels(r.notes);
        return (
          <li key={r.skillId} className="flex items-start gap-2 text-sm">
            <MarkIcon mark={r.mark} />
            <p>
              <span className="font-medium">{r.name}</span>
              {r.importance === "PREFERRED" && <span className="text-xs text-muted-foreground"> (preferred)</span>}
              <span className="text-muted-foreground"> · {r.text}</span>
              {notes.length > 0 && <span className="text-xs text-muted-foreground"> ({notes.join(", ")})</span>}
            </p>
          </li>
        );
      })}
    </ul>
  );
}