import { cn } from "@/lib/utils";

const STYLE = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-green-100 text-green-800",
  CLOSED: "bg-red-100 text-red-800",
} as const;

const LABEL = { DRAFT: "Draft", PUBLISHED: "Published", CLOSED: "Closed" } as const;

export function JobStatusBadge({ status, className }: { status: keyof typeof STYLE; className?: string }) {
  return (
    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", STYLE[status], className)}>
      {LABEL[status]}
    </span>
  );
}