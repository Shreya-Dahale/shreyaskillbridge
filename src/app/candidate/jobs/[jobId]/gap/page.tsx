import Link from "next/link";
import { notFound } from "next/navigation";
import { ListChecks } from "lucide-react";
import { StatusBar } from "@/components/charts/StatusBar";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCandidate } from "@/lib/candidate";
import { evidenceText, explainGap, historyText } from "@/lib/skills/describe";
import type { SkillGap } from "@/lib/skills/gap-engine";
import { loadGapAnalysis } from "@/lib/skills/load-gaps";

const COLUMNS = "sm:grid-cols-[1.1fr_1.2fr_1fr]";

function Group({ title, description, items }: { title: string; description: string; items: SkillGap[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">None listed.</p>
        ) : (
          <>
            <StatusBar statuses={items.map((g) => g.status)} />

            <div
              className={`hidden gap-3 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid ${COLUMNS}`}
            >
              <span>Skill</span>
              <span>Your experience on record</span>
              <span>Recent evidence</span>
            </div>

            <ul className="space-y-2">
              {items.map((gap) => {
                const { lines, hint } = explainGap(gap);
                return (
                  <li key={gap.skillId} className="space-y-2 rounded-lg border p-3">
                    <div className={`grid gap-3 sm:items-center ${COLUMNS}`}>
                      <div>
                        <p className="text-sm font-medium">{gap.name}</p>
                        {gap.minYears != null && (
                          <p className="text-xs text-muted-foreground">{gap.minYears}+ yrs asked</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground sm:hidden">Your experience on record</p>
                        <p className="text-sm">{historyText(gap)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground sm:hidden">Recent evidence</p>
                        <StatusBadge status={gap.status} />
                        <p className="text-xs text-muted-foreground">{evidenceText(gap.status)}</p>
                      </div>
                    </div>
                    <div className="space-y-0.5 border-t pt-2 text-xs text-muted-foreground">
                      {lines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                      {hint && <p className="font-medium text-foreground/80">{hint}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default async function GapPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const profile = await requireCandidate();

  const result = await loadGapAnalysis(profile.id, jobId);
  if (!result) notFound();

  const { job, gaps, hasSkills } = result;
  const required = gaps.filter((g) => g.importance === "REQUIRED");
  const preferred = gaps.filter((g) => g.importance === "PREFERRED");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="How you compare"
        description={`${job.title} · ${job.employer.companyName}`}
        back={{ href: `/candidate/jobs/${job.id}`, label: "Back to job" }}
      >
        <Link href="/candidate/tasks" className={buttonVariants({ variant: "outline" })}>
          <ListChecks /> Try a practice task
        </Link>
      </PageHeader>

      <Notice>
        This compares the skills on your profile with what the job asks for. It is based only on your skills and
        any practice tasks you complete. Your career break is not part of this comparison, and the result is not a
        score. Every status comes with a reason.
      </Notice>

      {!hasSkills && (
        <Notice tone="warning">
          Your profile has no skills yet, so everything below shows as not yet demonstrated.{" "}
          <Link href="/candidate/resume" className="font-medium underline underline-offset-4">
            Upload a resume
          </Link>{" "}
          to add your skills.
        </Notice>
      )}

      <Group
        title="Required skills"
        description="What the employer says the role depends on."
        items={required}
      />
      <Group title="Preferred skills" description="Nice to have, but not essential." items={preferred} />
    </div>
  );
}