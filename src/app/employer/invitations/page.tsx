import Link from "next/link";
import { Mail, Send } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { displayCode } from "@/lib/discovery/code";
import { requireEmployer } from "@/lib/employer";
import { DAILY_INVITATION_LIMIT, invitationState, invitationsRemaining, type InvitationState } from "@/lib/invitations/rules";

const STATE_STYLE: Record<InvitationState, string> = {
  PENDING: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-green-100 text-green-800",
  DECLINED: "bg-muted text-muted-foreground",
  EXPIRED: "bg-muted text-muted-foreground",
};
const STATE_LABEL: Record<InvitationState, string> = {
  PENDING: "Waiting for a reply",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
};

export default async function EmployerInvitationsPage() {
  const employer = await requireEmployer();
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [invitations, sentRecently] = await Promise.all([
    prisma.invitation.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        jobId: true,
        jobTitle: true,
        message: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        respondedAt: true,
        contactName: true,
        contactEmail: true,
        employerReadAt: true,
        candidate: { select: { discovery: { select: { code: true } } } },
      },
    }),
    prisma.invitation.count({ where: { employerId: employer.id, createdAt: { gte: since } } }),
  ]);

  // Answers shown here count as read from now on.
  const unreadIds = new Set(
    invitations.filter((i) => i.status !== "PENDING" && i.employerReadAt === null).map((i) => i.id)
  );
  if (unreadIds.size > 0) {
    await prisma.invitation.updateMany({
      where: { employerId: employer.id, status: { in: ["ACCEPTED", "DECLINED"] }, employerReadAt: null },
      data: { employerReadAt: now },
    });
  }

  const withState = invitations.map((i) => ({ ...i, state: invitationState(i, now) }));
  const accepted = withState.filter((i) => i.state === "ACCEPTED");
  const waiting = withState.filter((i) => i.state === "PENDING");
  const closed = withState.filter((i) => i.state === "DECLINED" || i.state === "EXPIRED");

  const label = (i: (typeof withState)[number]) =>
    i.candidate.discovery?.code ? displayCode(i.candidate.discovery.code) : "Candidate";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Invitations"
        description="Candidates reply to your invitations here. Contact details appear only after a candidate accepts."
      >
        <Link href="/employer/candidates" className={buttonVariants({ variant: "outline" })}>
          <Send /> Find candidates
        </Link>
      </PageHeader>

      <Notice>
        You have {invitationsRemaining(sentRecently)} of {DAILY_INVITATION_LIMIT} invitations left in the last 24
        hours. A declined or expired invitation can&apos;t be sent again for the same job.
      </Notice>

      {withState.length === 0 ? (
        <EmptyState icon={Mail} title="You haven't sent any invitations yet">
          Find a candidate for one of your published jobs, open their listing, and invite them.
        </EmptyState>
      ) : (
        <>
          {accepted.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Accepted ({accepted.length})</h2>
              <ul className="space-y-3">
                {accepted.map((i) => (
                  <li key={i.id}>
                    <Card>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{i.contactName ?? label(i)}</p>
                            <p className="text-xs text-muted-foreground">
                              {label(i)} · {i.jobTitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {unreadIds.has(i.id) && <Badge>New</Badge>}
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATE_STYLE.ACCEPTED}`}>
                              {STATE_LABEL.ACCEPTED}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-lg border bg-accent/40 p-3 text-sm">
                          <p className="font-medium">Contact details</p>
                          <p>{i.contactName}</p>
                          {i.contactEmail && (
                            <a href={`mailto:${i.contactEmail}`} className="font-medium underline underline-offset-4">
                              {i.contactEmail}
                            </a>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            Shared by the candidate on {i.respondedAt?.toLocaleDateString("en-GB")}, for this invitation
                            only. Please use it only to discuss this role.
                          </p>
                        </div>

                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground">Your message</summary>
                          <p className="mt-2 whitespace-pre-wrap rounded-lg border-l-4 bg-muted/50 p-3">{i.message}</p>
                        </details>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {waiting.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Waiting for a reply ({waiting.length})</h2>
              <ul className="space-y-3">
                {waiting.map((i) => (
                  <li key={i.id}>
                    <Card>
                      <CardContent className="space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{label(i)}</p>
                            <p className="text-xs text-muted-foreground">
                              {i.jobTitle} · sent {i.createdAt.toLocaleDateString("en-GB")} · expires{" "}
                              {i.expiresAt.toLocaleDateString("en-GB")}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATE_STYLE.PENDING}`}>
                            {STATE_LABEL.PENDING}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {closed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Closed ({closed.length})</h2>
              <ul className="space-y-3">
                {closed.map((i) => (
                  <li key={i.id}>
                    <Card>
                      <CardContent className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{label(i)}</p>
                          <p className="text-xs text-muted-foreground">
                            {i.jobTitle} · sent {i.createdAt.toLocaleDateString("en-GB")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadIds.has(i.id) && <Badge>New</Badge>}
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATE_STYLE[i.state]}`}>
                            {STATE_LABEL[i.state]}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}