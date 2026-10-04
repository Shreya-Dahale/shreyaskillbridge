import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";

export default async function JobsPage() {
  const profile = await requireEmployer();
  const jobs = await prisma.job.findMany({
    where: { employerId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { skills: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Jobs" description="Your job postings and the requirements behind them.">
        <Link href="/employer/jobs/new" className={buttonVariants()}>
          <Plus /> New job
        </Link>
      </PageHeader>

      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="You haven't created any jobs yet">
          Paste a job description and the AI will suggest its requirements for you to review.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/employer/jobs/${job.id}`}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="transition-shadow group-hover:shadow-md">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {job._count.skills} requirements · created {job.createdAt.toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}