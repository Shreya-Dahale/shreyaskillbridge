import { notFound } from "next/navigation";
import { Notice } from "@/components/Notice";
import { MatchBreakdown } from "@/components/discovery/MatchBreakdown";
import { PageHeader } from "@/components/PageHeader";
import { ProfileView } from "@/components/profile/ProfileView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { matchHeadline } from "@/lib/discovery/describe";
import { loadCandidateListing, loadDiscoveryJob } from "@/lib/discovery/load";
import { logDiscoveryView } from "@/lib/discovery/log-view";
import { requireEmployer } from "@/lib/employer";

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

      <ProfileView profile={listing.profile} />

      <Notice>Inviting this candidate to talk is the next step we are building.</Notice>
    </div>
  );
}