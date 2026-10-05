import { BridgeMark } from "./BridgeMark";

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <BridgeMark className="size-5" />
      </span>
      SkillBridge
    </span>
  );
}