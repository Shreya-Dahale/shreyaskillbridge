import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { invitationState, type InvitationState } from "@/lib/invitations/rules";
import { InviteForm } from "./InviteForm";

const STATE_STYLE: Record<InvitationState, string> = {
  PENDING: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-green-100 text-green-800",
  DECLINED: "bg-muted text-muted-foreground",
  EXPIRED: "bg-muted text-muted-foreground",
};

const STATE_LABEL: Record<InvitationState, string> = {
  PENDING: "Invitation sent",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
};

export function InvitationPanel({
  jobId,
  code,
  existing,
  remaining,
}: {
  jobId: string;
  code: string;
  existing: { status: "PENDING" | "ACCEPTED" | "DECLINED"; createdAt: Date; expiresAt: Date } | null;
  remaining: number;
}) {
  if (!existing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite this candidate</CardTitle>
          <CardDescription>
            The candidate sees your company, this job and your message. Their name and email are shared with you only
            if they accept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm jobId={jobId} code={code} remaining={remaining} />
        </CardContent>
      </Card>
    );
  }

  const state = invitationState(existing);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Invitation</CardTitle>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATE_STYLE[state]}`}>
            {STATE_LABEL[state]}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>Sent {existing.createdAt.toLocaleDateString("en-GB")}.</p>
        {state === "PENDING" && <p>It expires on {existing.expiresAt.toLocaleDateString("en-GB")} if it is not answered.</p>}
        {state === "ACCEPTED" && <p>The candidate accepted. Their contact details are shared with you for this invitation.</p>}
        {state === "DECLINED" && <p>The candidate declined. An invitation can be sent only once for each job.</p>}
        {state === "EXPIRED" && <p>It expired without a response. An invitation can be sent only once for each job.</p>}
      </CardContent>
    </Card>
  );
}