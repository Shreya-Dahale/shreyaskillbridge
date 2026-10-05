import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Circle,
  Eye,
  ListChecks,
  Mail,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/auth";
import { StatusBar } from "@/components/charts/StatusBar";
import { ViewsChart } from "@/components/charts/ViewsChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCandidate } from "@/lib/candidate";
import { loadCandidateDashboard, WINDOW_DAYS } from "@/lib/dashboard/load-candidate-dashboard";

function Stat({ icon: Icon, value, label, href }: { icon: LucideIcon; value: number; label: string; href: string }) {
  return (
    <Link href={href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="transition-shadow group-hover:shadow-md">
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
    </Link>
  );
}

export default async function CandidateHome() {
  const session = await auth();
  const profile = await requireCandidate();
  const data = await loadCandidateDashboard(profile.id);

  const firstName = session?.user?.name?.trim().split(" ")[0];
  const done = data.checklist.filter((i) => i.done).length;
  const allDone = done === data.checklist.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">Here is where your evidence stands today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Sparkles} value={data.stats.skills} label="skills on your profile" href="/candidate/skills" />
        <Stat icon={ListChecks} value={data.stats.tasksPassed} label="practice tasks passed" href="/candidate/tasks" />
        <Stat icon={Briefcase} value={data.stats.targets} label="target jobs (up to 5)" href="/candidate/jobs" />
        <Stat
          icon={Eye}
          value={data.stats.views}
          label={`profile views, last ${WINDOW_DAYS} days`}
          href="/candidate/share/activity"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/candidate/invitations" className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="h-full transition-shadow group-hover:shadow-md">
            <CardContent className="flex items-center gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Mail className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  {data.invitationsWaiting === 0
                    ? "No invitations waiting"
                    : `${data.invitationsWaiting} ${data.invitationsWaiting === 1 ? "invitation" : "invitations"} waiting`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Employers reach you only by invitation, and you decide whether to reply.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/candidate/discovery" className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="h-full transition-shadow group-hover:shadow-md">
            <CardContent className="flex items-center gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Search className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  {data.discoveryEnabled ? "Employers can find you" : "Employers can't find you"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.discoveryEnabled
                    ? `Your listing was opened ${data.listingViews} ${data.listingViews === 1 ? "time" : "times"} in the last ${WINDOW_DAYS} days.`
                    : "Discovery is off. Turn it on if you want employers to find you."}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your skills by status</CardTitle>
            <CardDescription>Based on your profile and the practice tasks you have passed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.skillStatuses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No skills yet.{" "}
                <Link href="/candidate/resume" className="font-medium text-foreground underline underline-offset-4">
                  Upload a resume
                </Link>{" "}
                to add yours.
              </p>
            ) : (
              <>
                <StatusBar statuses={data.skillStatuses} />
                <Link
                  href="/candidate/evidence"
                  className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
                >
                  <BadgeCheck className="size-4" aria-hidden="true" /> View your evidence profile
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Practice activity</CardTitle>
            <CardDescription>Task submissions in the last {WINDOW_DAYS} days.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.practiceTotal === 0 ? (
              <p className="text-sm text-muted-foreground">
                No submissions yet.{" "}
                <Link href="/candidate/tasks" className="font-medium text-foreground underline underline-offset-4">
                  Try a practice task
                </Link>{" "}
                to start building evidence.
              </p>
            ) : (
              <ViewsChart data={data.practiceBuckets} noun="submission" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}