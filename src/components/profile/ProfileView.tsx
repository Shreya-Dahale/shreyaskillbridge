import { Briefcase, FileText, ListChecks, Sparkles, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CareerTimeline } from "@/components/charts/CareerTimeline";
import { StatusBar } from "@/components/charts/StatusBar";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatMonthYear } from "@/lib/profile/format";
import { buildTimeline } from "@/lib/profile/timeline";
import type { SharedProfile } from "@/lib/profile/types";

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-primary" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

/** Renders a shared profile. It can only show what the builder put in. */
export function ProfileView({ profile }: { profile: SharedProfile }) {
  const timeline =
    profile.roles || profile.careerBreaks
      ? buildTimeline(profile.roles ?? [], profile.careerBreaks ?? [])
      : null;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <User className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
            {profile.headline && <p className="text-muted-foreground">{profile.headline}</p>}
          </div>
        </CardContent>
      </Card>

      {profile.summary && (
        <Section icon={FileText} title="Summary">
          <p className="text-sm leading-relaxed text-muted-foreground">{profile.summary}</p>
        </Section>
      )}

      {profile.skills && (
        <Section icon={Sparkles} title="Skills">
          {profile.skills.length === 0 ? (
            <Empty>No skills to show yet.</Empty>
          ) : (
            <>
              <StatusBar statuses={profile.skills.map((s) => s.status)} />
              <ul className="space-y-2">
                {profile.skills.map((s) => (
                  <li key={s.name} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.yearsSelfReported != null ? `${s.yearsSelfReported} yrs, self-reported` : "No years listed"}
                        {s.lastUsedYear != null && ` · last used ${s.lastUsedYear}`}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>
      )}

      {profile.assessments && (
        <Section icon={ListChecks} title="Passed practice tasks">
          {profile.assessments.length === 0 ? (
            <Empty>No practice tasks passed yet.</Empty>
          ) : (
            <ul className="space-y-2">
              {profile.assessments.map((a) => (
                <li key={a.taskTitle} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{a.taskTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    Evidence for {a.skills.join(", ")} · most recent pass {formatDate(a.passedOn)} ·{" "}
                    {a.attempts === 1 ? "first pass on the first attempt" : `first pass on attempt ${a.attempts}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {(profile.roles || profile.careerBreaks) && (
        <Section icon={Briefcase} title="Career timeline">
          {timeline ? <CareerTimeline timeline={timeline} /> : <Empty>Nothing to show on a timeline.</Empty>}
          {profile.roles && profile.roles.length > 0 && (
            <ul className="space-y-2 pt-2">
              {profile.roles.map((r) => (
                <li key={`${r.jobTitle}-${r.company}-${r.startDate.toISOString()}`} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">
                    {r.jobTitle} · {r.company}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatMonthYear(r.startDate)} – {r.endDate ? formatMonthYear(r.endDate) : "present"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {profile.notices.length > 0 && (
        <aside className="space-y-1 rounded-lg bg-muted p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">How to read this profile</p>
          <ul className="list-disc space-y-1 pl-4">
            {profile.notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p className="pt-1">Generated {formatDate(profile.generatedAt)}.</p>
        </aside>
      )}
    </div>
  );
}