import { ExternalLink, Inbox, ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { acceptInvitation, blockCompany, declineInvitation, unblockCompany } from "@/app/actions/inbox";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";
import { daysLeft, partitionInvitations } from "@/lib/invitations/inbox";
import { invitationState, type InvitationState } from "@/lib/invitations/rules";
import { discoveryToShareSettings, includedLabels } from "@/lib/profile/settings";

const STATE_STYLE: Record<InvitationState, string> = {
  PENDING: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-green-100 text-green-800",
  DECLINED: "bg-muted text-muted-foreground",
  EXPIRED: "bg-muted text-muted-foreground",
};
const STATE_LABEL: Record<InvitationState, string> = {
  PENDING: "Waiting for you",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
};

type Params = { accepted?: string; declined?: string; blocked?: string; unblocked?: string; error?: string };

export default async function InvitationsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const profile = await requireCandidate();

  const [user, invitations, blocks, discovery] = await Promise.all([
    prisma.user.findUnique({ where: { id: profile.userId }, select: { name: true, email: true } }),
    prisma.invitation.findMany({
      where: { candidateId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        employerId: true,
        companyName: true,
        jobTitle: true,
        message: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        respondedAt: true,
        candidateReadAt: true,
        employer: { select: { website: true, about: true } },
        job: { select: { status: true } },
      },
    }),
    prisma.companyBlock.findMany({
      where: { candidateId: profile.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, employerId: true, createdAt: true, employer: { select: { companyName: true } } },
    }),
    prisma.discoverySettings.findUnique({
      where: { candidateId: profile.id },
      select: {
        includeHeadline: true,
        includeSkills: true,
        includeAssessments: true,
        includeSummary: true,
        includeRoles: true,
        includeBreak: true,
      },
    }),
  ]);

  const now = new Date();
  const { pending, answered } = partitionInvitations(invitations, now);
  const blockedIds = new Set(blocks.map((b) => b.employerId));
  const sharedLabels = discovery ? includedLabels(discoveryToShareSettings(discovery)) : [];

  // Everything shown here counts as read from now on.
  const unreadIds = new Set(invitations.filter((i) => i.candidateReadAt === null).map((i) => i.id));
  if (unreadIds.size > 0) {
    await prisma.invitation.updateMany({
      where: { candidateId: profile.id, candidateReadAt: null },
      data: { candidateReadAt: now },
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Invitations"
        description="Employers can only reach you by invitation. Your name and email are shared with a company only if you accept, and only for that invitation."
      />

      {params.accepted && <Notice tone="success">Accepted. The company can now see your name and email for that invitation.</Notice>}
      {params.declined && <Notice tone="success">Declined. The company only sees that you declined.</Notice>}
      {params.blocked && (
        <Notice tone="success">
          Company blocked. It can no longer find you or invite you, and its open invitations were declined.
        </Notice>
      )}
      {params.unblocked && <Notice tone="success">Company unblocked.</Notice>}
      {params.error && (
        <Notice tone="error">
          That invitation can no longer be answered. It may have expired or already been answered.
        </Notice>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Waiting for your reply ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState icon={Inbox} title="No invitations waiting">
            When an employer invites you, it appears here.
          </EmptyState>
        ) : (
          <ul className="space-y-4">
            {pending.map((i) => (
              <li key={i.id}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{i.companyName}</CardTitle>
                        <CardDescription>Invites you to talk about {i.jobTitle}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadIds.has(i.id) && <Badge>New</Badge>}
                        <span className="text-xs text-muted-foreground">
                          {daysLeft(i.expiresAt, now)} {daysLeft(i.expiresAt, now) === 1 ? "day" : "days"} left
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <blockquote className="whitespace-pre-wrap rounded-lg border-l-4 bg-muted/50 p-4 text-sm">
                      {i.message}
                    </blockquote>

                    {(i.employer.about || i.employer.website) && (
                      <div className="space-y-1 text-sm">
                        {i.employer.about && <p className="text-muted-foreground">{i.employer.about}</p>}
                        {i.employer.website && (
                          <a
                            href={i.employer.website}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 font-medium underline underline-offset-4"
                          >
                            {i.employer.website} <ExternalLink className="size-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    )}

                    {i.job?.status !== "PUBLISHED" && (
                      <p className="text-xs text-amber-700">This job is no longer open.</p>
                    )}

                    {sharedLabels.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Your listing currently shares: {sharedLabels.join(", ")}.
                      </p>
                    )}

                    <div className="rounded-lg border bg-accent/40 p-3 text-sm">
                      <p className="font-medium">If you accept</p>
                      <p className="text-muted-foreground">
                        {i.companyName} will see your name ({user?.name}) and your email ({user?.email}), for this
                        invitation only. If you decline, they see only that you declined.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <form action={acceptInvitation}>
                        <input type="hidden" name="id" value={i.id} />
                        <Button type="submit">Accept and share my contact details</Button>
                      </form>
                      <form action={declineInvitation}>
                        <input type="hidden" name="id" value={i.id} />
                        <Button type="submit" variant="outline">
                          Decline
                        </Button>
                      </form>
                      <form action={blockCompany} className="sm:ml-auto">
                        <input type="hidden" name="id" value={i.id} />
                        <Button type="submit" variant="ghost" className="text-destructive hover:text-destructive">
                          <ShieldAlert /> Block this company
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {answered.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Earlier invitations</h2>
          <ul className="space-y-3">
            {answered.map((i) => {
              const state = invitationState(i, now);
              return (
                <li key={i.id}>
                  <Card>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{i.companyName}</p>
                          <p className="text-xs text-muted-foreground">
                            {i.jobTitle} · received {i.createdAt.toLocaleDateString("en-GB")}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATE_STYLE[state]}`}
                        >
                          {STATE_LABEL[state]}
                        </span>
                      </div>
                      {state === "ACCEPTED" && i.respondedAt && (
                        <p className="text-xs text-muted-foreground">
                          You shared your name and email with {i.companyName} on{" "}
                          {i.respondedAt.toLocaleDateString("en-GB")}.
                        </p>
                      )}
                      {blockedIds.has(i.employerId) ? (
                        <Badge variant="outline">Company blocked</Badge>
                      ) : (
                        <form action={blockCompany}>
                          <input type="hidden" name="id" value={i.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <ShieldAlert /> Block this company
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {blocks.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Blocked companies</h2>
          <ul className="space-y-2">
            {blocks.map((b) => (
              <li key={b.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{b.employer.companyName}</p>
                      <p className="text-xs text-muted-foreground">
                        Blocked {b.createdAt.toLocaleDateString("en-GB")}. They cannot find you or invite you.
                      </p>
                    </div>
                    <form action={unblockCompany}>
                      <input type="hidden" name="id" value={b.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Unblock
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}