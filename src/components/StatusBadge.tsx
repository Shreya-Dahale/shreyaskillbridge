import { CheckCircle2, Circle, CircleDot, RefreshCw } from "lucide-react";
import { STATUS_LABEL, STATUS_STYLE } from "@/lib/skills/describe";
import type { SkillStatus } from "@/lib/skills/gap-engine";
import { cn } from "@/lib/utils";

const ICON = {
  DEMONSTRATED: CheckCircle2,
  DEVELOPING: CircleDot,
  NEEDS_REFRESH: RefreshCw,
  NOT_YET_DEMONSTRATED: Circle,
} as const;

export function StatusBadge({ status, className }: { status: SkillStatus; className?: string }) {
  const Icon = ICON[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLE[status],
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}