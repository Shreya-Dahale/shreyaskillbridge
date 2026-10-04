"use client";

import { Check, Copy } from "lucide-react";
import { useActionState, useState } from "react";
import { createShareLink, type CreateResult } from "@/app/actions/share";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Field = { key: string; label: string; hint?: string };

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function CreateShareForm({
  fields,
  defaults,
  expiryOptions,
}: {
  fields: Field[];
  defaults: Record<string, boolean>;
  expiryOptions: { days: number; label: string }[];
}) {
  const [state, formAction, pending] = useActionState<CreateResult, FormData>(createShareLink, {});
  const [copied, setCopied] = useState(false);

  const link = state.token ? `${window.location.origin}/p/${state.token}` : null;

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {link && (
        <div className="space-y-3 rounded-xl border border-green-300 bg-green-50 p-4">
          <div>
            <p className="text-sm font-medium text-green-900">Your share link is ready</p>
            <p className="text-xs text-green-900">
              This is the only time the full link is shown. Copy it now. If you lose it, revoke it and create a new
              one.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              readOnly
              value={link}
              aria-label="Share link"
              onFocus={(e) => e.currentTarget.select()}
              className="bg-white font-mono text-xs"
            />
            <Button type="button" onClick={copy} className="shrink-0">
              {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      {state.error && <Notice tone="error">{state.error}</Notice>}

      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create a share link</CardTitle>
            <CardDescription>
              Each link has its own sections, audience and expiry. You can revoke it at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <fieldset className="space-y-3">
              <legend className="mb-1 text-sm font-medium">What to include</legend>
              <ul className="grid gap-3 sm:grid-cols-2">
                {fields.map((f) => (
                  <li key={f.key}>
                    <label className="flex items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        name={f.key}
                        defaultChecked={defaults[f.key]}
                        className="mt-0.5 size-4 accent-primary"
                      />
                      <span>
                        {f.label}
                        {f.hint && <span className="block text-xs text-muted-foreground">{f.hint}</span>}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="audience">Who can open it</Label>
                <select id="audience" name="audience" defaultValue="EMPLOYERS" className={selectClass}>
                  <option value="EMPLOYERS">Logged-in employers only</option>
                  <option value="ANYONE">Anyone with the link</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="days">Link lasts</Label>
                <select id="days" name="days" defaultValue="30" className={selectClass}>
                  {expiryOptions.map((o) => (
                    <option key={o.days} value={o.days}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Label (only you see this)</Label>
              <Input id="label" name="label" maxLength={60} placeholder="e.g. Acme Technologies" />
            </div>

            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create share link"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}