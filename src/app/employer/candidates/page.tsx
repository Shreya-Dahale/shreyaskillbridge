import Link from "next/link";
import { Briefcase, Search } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";

export default async function FindCandidatesPage() {
  const employer = await requireEmployer();
  const jobs = await prisma.job.findMany({
    where: { employerId: employer.id, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true, _count: { select: { skills: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Find candidates"
        description="Choose one of your published jobs. Candidates who chose to be discoverable are shown by the evidence they have for that job's requirements."
      />

      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No published jobs">
          Publish a job first. Searching always starts from a job, so you see why each candidate is relevant to it.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job._count.skills} requirements · published {job.createdAt.toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <Link href={`/employer/jobs/${job.id}/candidates`} className={buttonVariants({ size: "sm" })}>
                    <Search /> Find candidates
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}