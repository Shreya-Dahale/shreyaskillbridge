import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const TONES = {
  error: { Icon: AlertCircle, variant: "destructive" as const, box: "", text: "text-destructive" },
  success: {
    Icon: CheckCircle2,
    variant: "default" as const,
    box: "border-green-300 bg-green-50 text-green-900",
    text: "text-green-900",
  },
  warning: {
    Icon: AlertCircle,
    variant: "default" as const,
    box: "border-amber-300 bg-amber-50 text-amber-900",
    text: "text-amber-900",
  },
  info: { Icon: Info, variant: "default" as const, box: "", text: "text-muted-foreground" },
};

export function Notice({
  tone = "info",
  children,
}: {
  tone?: keyof typeof TONES;
  children: React.ReactNode;
}) {
  const { Icon, variant, box, text } = TONES[tone];
  return (
    <Alert variant={variant} className={cn(box)}>
      <Icon />
      <AlertDescription className={text}>{children}</AlertDescription>
    </Alert>
  );
}