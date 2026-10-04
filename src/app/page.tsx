import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Eye,
  FileText,
  ListChecks,
  Share2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { auth } from "@/auth";
import { StatusBar } from "@/components/charts/StatusBar";
import { Logo } from "@/components/shell/Logo";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SkillStatus } from "@/lib/skills/gap-engine";
import { StatusBadge } from "@/components/StatusBadge";

const SAMPLE: { name: string; detail: string; status: SkillStatus }[] = [
  { name: "Java", detail: "4 yrs, self-reported · last used 2023", status: "DEMONSTRATED" },
  { name: "SQL", detail: "3 yrs, self-reported · last used 2023", status: "DEMONSTRATED" },
  { name: "REST APIs", detail: "2 yrs, self-reported · last used 2023", status: "DEVELOPING" },
  { name: "Spring", detail: "3 yrs, self-reported · last used 2023", status: "NEEDS_REFRESH" },
  { name: "Docker", detail: "No years listed", status: "NOT_YET_DEMONSTRATED" },
];

const STEPS = [
  { icon: FileText, title: "Start with your history", text: "Upload your resume. AI reads it, and you review and correct everything before it is saved." },
  { icon: Briefcase, title: "See how you compare", text: "Pick a job and see each required skill with a plain-language reason. No score." },
  { icon: ListChecks, title: "Build current evidence", text: "Complete short practice tasks in Java, SQL and REST. Hidden test cases keep the results honest." },
  { icon: Share2, title: "Share what you choose", text: "Create a link with exactly the sections you want, an expiry date, and a revoke button." },
];

const PRINCIPLES = [
  { icon: ShieldCheck, title: "A career break is not a score", text: "Your break never enters the skill comparison, and there is no field for a reason." },
  { icon: UserCheck, title: "You are in control", text: "Nothing is visible until you share it. You can see who viewed your profile and when." },
  { icon: Eye, title: "AI assists, people decide", text: "AI reads and organises. You verify. Employers make every hiring decision." },
];

export default async function Home() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role === "CANDIDATE") redirect("/candidate");
  if (role === "EMPLOYER") redirect("/employer");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Log in
            </Link>
            <Link href="/register" className={buttonVariants()}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-8 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <BadgeCheck className="size-3.5" /> Evidence-based career re-entry
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Don&apos;t hide the career gap.{" "}
              <span className="text-primary">Fill the evidence gap.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              ReLaunch helps professionals returning after a break turn past experience into credible,
              up-to-date evidence of what they can do today, and share it on their own terms.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className={buttonVariants({ size: "lg" })}>
                Build your evidence <ArrowRight />
              </Link>
              <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
                Log in
              </Link>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Sample evidence profile
              </p>
              <CardTitle className="text-xl">Candidate</CardTitle>
              <CardDescription>Java developer returning after a career break</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusBar statuses={SAMPLE.map((s) => s.status)} />
              <ul className="space-y-2">
                {SAMPLE.map((s) => (
                  <li key={s.name} className="flex items-start justify-between gap-3 rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.detail}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                An illustration. Real profiles show only the sections their owner chooses to share.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="border-y bg-muted/40">
          <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 md:px-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
              <p className="text-muted-foreground">
                From your resume to evidence an employer can trust, in four steps.
              </p>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <Card className="h-full">
                    <CardHeader>
                      <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <step.icon className="size-5" />
                      </span>
                      <CardTitle className="text-base">
                        {i + 1}. {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{step.text}</CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-10 px-4 py-16 md:px-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">Built to be fair</h2>
            <p className="text-muted-foreground">
              Career-break discrimination is real, and a single opaque score would only add to it.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="space-y-2">
                <p.icon className="size-6 text-primary" />
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-16 md:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center md:p-12">
            <div className="max-w-xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Hiring?</h2>
              <p className="text-primary-foreground/90">
                Post a job, review the requirements AI extracts from it, and read evidence that candidates
                choose to share with you: what they have done, and what they can show today.
              </p>
            </div>
            <Link href="/register" className={buttonVariants({ size: "lg", variant: "secondary" })}>
              Create an employer account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:justify-between md:px-8">
          <p>ReLaunch · Past experience tells an employer where you have been. Evidence shows what you can do now.</p>
          <p>Practice tasks are completed independently and are not supervised.</p>
        </div>
      </footer>
    </div>
  );
}