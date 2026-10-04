import Link from "next/link";
import { Briefcase, Check, Target } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addTarget, removeTarget } from "@/app/actions/targets";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";

const errors: Record<string, string> = {
  unavailable: "That job is no longer available.",
  max: "You can target up to 5 jobs. Remove one to add another.",
};

export default async function CandidateJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const profile = await requireCandidate();

  const [jobs, targets] = await Promise.all([
    prisma.job.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        employer: { select: { companyName: true } },
        _count: { select: { skills: true } },
      },
    }),
    prisma.targetJob.findMany({
      where: { candidateId: profile.id },
      orderBy: { createdAt: "desc" },
      select: {
        jobId: true,
        job: {
          select: {
            title: true,
            status: true,
            employer: { select: { companyName: true } },
          },
        },
      },
    }),
  ]);

  const targetIds = new Set(targets.map((t) => t.jobId));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Jobs"
        description="Pick the jobs you are aiming for, then see how your skills compare with each one."
      />

      {error && <Notice tone="error">{errors[error] ?? "Something went wrong."}</Notice>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your target jobs ({targets.length}/5)</h2>
        {targets.length === 0 ? (
          <EmptyState icon={Target} title="No target job yet">
            Choose one from the open jobs below to see how your skills compare.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {targets.map((t) => {
              const open = t.job.status === "PUBLISHED";
              return (
                <li key={t.jobId}>
                  <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        {open ? (
                          <Link href={`/candidate/jobs/${t.jobId}`} className="text-sm font-medium hover:underline">
                            {t.job.title}
                          </Link>
                        ) : (
                          <p className="text-sm font-medium">{t.job.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{t.job.employer.companyName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {open ? (
                          <Link href={`/candidate/jobs/${t.jobId}/gap`} className={buttonVariants({ size: "sm" })}>
                            How I compare
                          </Link>
                        ) : (
                          <Badge variant="outline">No longer open</Badge>
                        )}
                        <form action={removeTarget}>
                          <input type="hidden" name="jobId" value={t.jobId} />
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            Remove
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Open jobs</h2>
        {jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs are open right now">
            Check back soon. Employers publish jobs here once they have reviewed the requirements.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link href={`/candidate/jobs/${job.id}`} className="text-sm font-medium hover:underline">
                        {job.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {job.employer.companyName} · {job._count.skills} requirements ·{" "}
                        {job.createdAt.toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    {targetIds.has(job.id) ? (
                      <Badge variant="secondary">
                        <Check /> Targeted
                      </Badge>
                    ) : (
                      <form action={addTarget}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <Button type="submit" variant="outline" size="sm">
                          <Target /> Set as target
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}