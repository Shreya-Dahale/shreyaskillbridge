"use client";

import { Send } from "lucide-react";
import { useActionState, useState } from "react";
import { sendInvitation, type InviteResult } from "@/app/actions/invitations";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MESSAGE_CHARS, MIN_MESSAGE_CHARS } from "@/lib/invitations/rules";

export function InviteForm({
  jobId,
  code,
  remaining,
}: {
  jobId: string;
  code: string;
  remaining: number;
}) {
  const [state, formAction, pending] = useActionState<InviteResult, FormData>(sendInvitation, {});
  const [message, setMessage] = useState("");

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="code" value={code} />

      {state.error && <Notice tone="error">{state.error}</Notice>}

      <div className="space-y-2">
        <Label htmlFor="message">Your message to the candidate</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          maxLength={MAX_MESSAGE_CHARS}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say who you are, what the role is, and why this candidate's evidence stood out."
          required
        />
        <p className="flex justify-between text-xs text-muted-foreground">
          <span>
            {MIN_MESSAGE_CHARS} to {MAX_MESSAGE_CHARS} characters. No links or email addresses.
          </span>
          <span>
            {message.length}/{MAX_MESSAGE_CHARS}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || remaining === 0}>
          <Send /> {pending ? "Sending..." : "Send invitation"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {remaining === 0
            ? "You have used all your invitations for the last 24 hours."
            : `${remaining} ${remaining === 1 ? "invitation" : "invitations"} left in the last 24 hours`}
        </span>
      </div>
    </form>
  );
}