import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { MatchBreakdown } from "@/components/discovery/MatchBreakdown";
import { EmptyState } from "@/components/EmptyState";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { displayCode } from "@/lib/discovery/code";
import { matchHeadline } from "@/lib/discovery/describe";
import { loadDiscoveryJob, loadGroupedMatches } from "@/lib/discovery/load";
import { requireEmployer } from "@/lib/employer";

export default async function CandidatesForJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const employer = await requireEmployer();

  const job = await loadDiscoveryJob(jobId, employer.id);
  if (!job) notFound();

  const groups = await loadGroupedMatches(job, employer.id);
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={`Candidates for ${job.title}`}
        description="Grouped by how much recent evidence each candidate has for the required skills. There is no ranking or score, and candidates choose what appears here."
        back={{ href: `/employer/jobs/${job.id}`, label: "Back to job" }}
      />

      <Notice>
        Candidates appear only if they chose to be discoverable. &quot;Nothing shown for this skill&quot; means the
        candidate has not shared evidence for it. It does not mean they lack it. Inside a group the order is arbitrary.
      </Notice>

      {total === 0 ? (
        <EmptyState icon={Users} title="No matching candidates yet">
          No discoverable candidate has shared evidence relevant to this job. Check back later, as candidates choose
          when to appear.
        </EmptyState>
      ) : (
        groups.map((group) => (
          <section key={group.group} className="space-y-3">
            <h2 className="text-lg font-semibold">
              {group.label} <span className="text-sm font-normal text-muted-foreground">({group.items.length})</span>
            </h2>
            <ul className="space-y-3">
              {group.items.map((item) => (
                <li key={item.code}>
                  <Card>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{displayCode(item.code)}</p>
                          <p className="text-xs text-muted-foreground">{matchHeadline(item.match)}</p>
                        </div>
                        <Link
                          href={`/employer/jobs/${job.id}/candidates/${item.code}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          View listing
                        </Link>
                      </div>
                      <MatchBreakdown rows={item.match.rows} />
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}