import { notFound } from "next/navigation";
import { InvitationPanel } from "@/components/discovery/InvitationPanel";
import { MatchBreakdown } from "@/components/discovery/MatchBreakdown";
import { PageHeader } from "@/components/PageHeader";
import { ProfileView } from "@/components/profile/ProfileView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { matchHeadline } from "@/lib/discovery/describe";
import { loadCandidateListing, loadDiscoveryJob } from "@/lib/discovery/load";
import { logDiscoveryView } from "@/lib/discovery/log-view";
import { requireEmployer } from "@/lib/employer";
import { invitationsRemaining } from "@/lib/invitations/rules";

export default async function CandidateListingPage({
  params,
}: {
  params: Promise<{ jobId: string; code: string }>;
}) {
  const { jobId, code } = await params;
  const employer = await requireEmployer();

  const job = await loadDiscoveryJob(jobId, employer.id);
  if (!job) notFound();

  const listing = await loadCandidateListing(job, employer.id, code);
  if (!listing) notFound();

  await logDiscoveryView({
    candidateId: listing.candidateId,
    employerId: employer.id,
    companyName: employer.companyName,
    jobTitle: job.title,
  });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [existing, sentRecently] = await Promise.all([
    prisma.invitation.findUnique({
      where: { jobId_candidateId: { jobId: job.id, candidateId: listing.candidateId } },
      select: { status: true, createdAt: true, expiresAt: true },
    }),
    prisma.invitation.count({ where: { employerId: employer.id, createdAt: { gte: since } } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={`Match for ${job.title}`}
        description="This candidate chose what to share. The listing below shows only that."
        back={{ href: `/employer/jobs/${job.id}/candidates`, label: "Back to candidates" }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How this candidate relates to the role</CardTitle>
          <CardDescription>{matchHeadline(listing.match)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <MatchBreakdown rows={listing.match.rows} />
          <p className="text-xs text-muted-foreground">
            &quot;Nothing shown&quot; means the candidate has not shared evidence for that skill. It does not mean they
            lack it.
          </p>
        </CardContent>
      </Card>

      <InvitationPanel
        jobId={job.id}
        code={listing.code}
        existing={existing}
        remaining={invitationsRemaining(sentRecently)}
      />

      <ProfileView profile={listing.profile} />
    </div>
  );
}