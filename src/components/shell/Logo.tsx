import { Rocket } from "lucide-react";

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Rocket className="size-4" />
      </span>
      ReLaunch
    </span>
  );
}