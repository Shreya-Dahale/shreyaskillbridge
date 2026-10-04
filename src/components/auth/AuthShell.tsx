import Link from "next/link";
import { CheckCircle2, Rocket } from "lucide-react";
import { Logo } from "@/components/shell/Logo";

const POINTS = [
  "Your career break never enters the skill comparison",
  "You choose exactly what an employer can see",
  "AI assists, you review, and people decide",
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Rocket className="size-4" />
          </span>
          ReLaunch
        </Link>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Don&apos;t hide the career gap. Fill the evidence gap.
          </h2>
          <ul className="space-y-3 text-sm text-primary-foreground/90">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/70">
          Past experience tells an employer where you have been. Evidence shows what you can do now.
        </p>
      </aside>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <Link href="/" className="inline-block lg:hidden">
            <Logo />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}