import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addTarget, removeTarget } from "@/app/actions/targets";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";

export default async function CandidateJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const profile = await requireCandidate();

  const job = await prisma.job.findFirst({
    where: { id: jobId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      employer: { select: { companyName: true, website: true, about: true } },
      skills: {
        select: { importance: true, minYears: true, skill: { select: { name: true } } },
        orderBy: [{ importance: "asc" }, { skill: { name: "asc" } }],
      },
    },
  });
  if (!job) notFound();

  const target = await prisma.targetJob.findUnique({
    where: { candidateId_jobId: { candidateId: profile.id, jobId: job.id } },
  });

  const required = job.skills.filter((s) => s.importance === "REQUIRED");
  const preferred = job.skills.filter((s) => s.importance === "PREFERRED");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={job.title}
        description={`${job.employer.companyName} · posted ${job.createdAt.toLocaleDateString("en-GB")}`}
        back={{ href: "/candidate/jobs", label: "All jobs" }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/candidate/jobs/${job.id}/gap`} className={buttonVariants()}>
            See how your skills compare
          </Link>
          {target ? (
            <form action={removeTarget}>
              <input type="hidden" name="jobId" value={job.id} />
              <Button type="submit" variant="outline">
                Remove target
              </Button>
            </form>
          ) : (
            <form action={addTarget}>
              <input type="hidden" name="jobId" value={job.id} />
              <Button type="submit" variant="outline">
                <Target /> Set as target
              </Button>
            </form>
          )}
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requirements</CardTitle>
          <CardDescription>What the employer asks for, as reviewed by the employer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Required</p>
            {required.length === 0 ? (
              <p className="text-sm text-muted-foreground">None listed.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {required.map((s) => (
                  <Badge key={s.skill.name} variant="secondary">
                    {s.skill.name}
                    {s.minYears != null && ` · ${s.minYears}+ yrs`}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Preferred</p>
            {preferred.length === 0 ? (
              <p className="text-sm text-muted-foreground">None listed.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {preferred.map((s) => (
                  <Badge key={s.skill.name} variant="outline">
                    {s.skill.name}
                    {s.minYears != null && ` · ${s.minYears}+ yrs`}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {(job.employer.about || job.employer.website) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About {job.employer.companyName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {job.employer.about && <p className="text-muted-foreground">{job.employer.about}</p>}
            {job.employer.website && (
              <a
                href={job.employer.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 font-medium underline underline-offset-4"
              >
                {job.employer.website} <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job description</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
            {job.description}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}