import Link from "next/link";
import {
  Archive,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Circle,
  Eye,
  FileText,
  Mail,
  Users,
  type LucideIcon,
} from "lucide-react";
import { HorizontalBars } from "@/components/charts/HorizontalBars";
import { EmptyState } from "@/components/EmptyState";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadEmployerDashboard } from "@/lib/dashboard/load-employer-dashboard";
import { requireEmployer } from "@/lib/employer";

function Stat({ icon: Icon, value, label, href }: { icon: LucideIcon; value: number; label: string; href?: string }) {
  const card = (
    <Card className={href ? "transition-shadow group-hover:shadow-md" : undefined}>
      <CardContent className="flex items-center gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {card}
    </Link>
  ) : (
    card
  );
}

export default async function EmployerHome() {
  const profile = await requireEmployer();
  const data = await loadEmployerDashboard(profile.id);

  const done = data.checklist.filter((i) => i.done).length;
  const allDone = done === data.checklist.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{profile.companyName}</h1>
        <p className="text-sm text-muted-foreground">Your jobs and the requirements behind them.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Briefcase} value={data.counts.published} label="published jobs" href="/employer/jobs" />
        <Stat icon={FileText} value={data.counts.draft} label="draft jobs" href="/employer/jobs" />
        <Stat icon={Archive} value={data.counts.closed} label="closed jobs" href="/employer/jobs" />
        <Stat
          icon={Eye}
          value={data.profilesViewed}
          label={`shared profiles you viewed, last ${data.windowDays} days`}
        />
      </div>

      {!allDone && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Getting started</CardTitle>
            <CardDescription>
              {done} of {data.checklist.length} steps done
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {data.checklist.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent/60"
                  >
                    {item.done ? (
                      <CheckCircle2 className="size-5 text-green-600" aria-label="Done" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground" aria-label="Not done yet" />
                    )}
                    <span className={item.done ? "text-muted-foreground line-through" : "font-medium"}>
                      {item.label}
                    </span>
                    {!item.done && <ArrowRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="size-4 text-primary" aria-hidden="true" /> Invitations
              </CardTitle>
              <CardDescription>The invitations you have sent, by outcome.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href="/employer/candidates" className={buttonVariants({ size: "sm" })}>
                <Users /> Find candidates
              </Link>
              <Link href="/employer/invitations" className={buttonVariants({ variant: "outline", size: "sm" })}>
                View all
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Waiting for a reply", value: data.invitations.waiting },
              { label: "Accepted", value: data.invitations.accepted },
              { label: "Declined", value: data.invitations.declined },
              { label: "Expired", value: data.invitations.expired },
            ].map((x) => (
              <div key={x.label}>
                <dd className="text-2xl font-semibold leading-none">{x.value}</dd>
                <dt className="mt-1 text-xs text-muted-foreground">{x.label}</dt>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most requested skills</CardTitle>
            <CardDescription>How many of your jobs ask for each skill.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Requirements appear here once you have reviewed a job&apos;s requirements.
              </p>
            ) : (
              <HorizontalBars
                label="Most requested skills"
                rows={data.topSkills.map((s) => ({ label: s.name, count: s.count }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentJobs.length === 0 ? (
              <EmptyState icon={Briefcase} title="No jobs yet">
                <Link href="/employer/jobs/new" className="font-medium text-foreground underline underline-offset-4">
                  Create your first job
                </Link>
              </EmptyState>
            ) : (
              <>
                <ul className="space-y-2">
                  {data.recentJobs.map((job) => (
                    <li key={job.id}>
                      <Link
                        href={`/employer/jobs/${job.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/40"
                      >
                        <div>
                          <p className="text-sm font-medium">{job.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {job._count.skills} requirements · {job.createdAt.toLocaleDateString("en-GB")}
                          </p>
                        </div>
                        <JobStatusBadge status={job.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/employer/jobs" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  All jobs
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}