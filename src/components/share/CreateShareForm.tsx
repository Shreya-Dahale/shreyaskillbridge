"use client";

import { useActionState, useState } from "react";
import { createShareLink, type CreateResult } from "@/app/actions/share";

type Field = { key: string; label: string; hint?: string };

const input = "w-full rounded border p-2 text-sm";

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
        <div className="space-y-2 rounded-lg border border-green-300 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-900">Your share link is ready</p>
          <p className="text-xs text-green-900">
            This is the only time the full link is shown. Copy it now. If you lose it, revoke it and create a new one.
          </p>
          <div className="flex gap-2">
            <input readOnly value={link} className={`${input} bg-white font-mono text-xs`} />
            <button type="button" onClick={copy} className="whitespace-nowrap rounded bg-black px-3 py-2 text-sm text-white">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {state.error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">{state.error}</p>
      )}

      <form action={formAction} className="space-y-5 rounded-lg border bg-white p-5 shadow-sm">
        <div>
          <p className="font-medium">What to include</p>
          <ul className="mt-2 grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <li key={f.key}>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name={f.key} defaultChecked={defaults[f.key]} className="mt-1" />
                  <span>
                    {f.label}
                    {f.hint && <span className="block text-xs text-gray-500">{f.hint}</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Who can open it
            <select name="audience" defaultValue="EMPLOYERS" className={`${input} mt-1`}>
              <option value="EMPLOYERS">Logged-in employers only</option>
              <option value="ANYONE">Anyone with the link</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Link lasts
            <select name="days" defaultValue="30" className={`${input} mt-1`}>
              {expiryOptions.map((o) => (
                <option key={o.days} value={o.days}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium">
          Label (only you see this)
          <input name="label" maxLength={60} placeholder="e.g. Acme Technologies" className={`${input} mt-1`} />
        </label>

        <button disabled={pending} className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60">
          {pending ? "Creating..." : "Create share link"}
        </button>
      </form>
    </div>
  );
}