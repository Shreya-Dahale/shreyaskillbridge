import { Eye, ShieldCheck } from "lucide-react";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { ProfileView } from "@/components/profile/ProfileView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveDiscovery } from "@/app/actions/discovery";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";
import { displayCode } from "@/lib/discovery/code";
import { DEFAULT_DISCOVERY, canBeMatched, type DiscoveryForm } from "@/lib/discovery/settings";
import { buildSharedProfile } from "@/lib/profile/build-profile";
import { loadProfileSource } from "@/lib/profile/load-source";
import { discoveryToShareSettings } from "@/lib/profile/settings";

const FIELDS: { key: keyof Omit<DiscoveryForm, "enabled">; label: string; hint: string }[] = [
  { key: "includeSkills", label: "Skills and their status", hint: "Used to find you for a job, and shown on your listing." },
  { key: "includeAssessments", label: "Passed practice tasks", hint: "Used to find you for a job, and shown on your listing." },
  { key: "includeHeadline", label: "Headline", hint: "Shown when an employer opens your listing. Never used for matching." },
  { key: "includeSummary", label: "Summary", hint: "Shown when an employer opens your listing. Never used for matching." },
  { key: "includeRoles", label: "Roles (titles, companies, dates)", hint: "Shown when an employer opens your listing. Never used for matching." },
  { key: "includeBreak", label: "Career break dates", hint: "Dates only. Never used for matching or ordering." },
];

const errors: Record<string, string> = {
  sections: "Choose at least one section to share, or leave discovery switched off.",
};

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const candidate = await requireCandidate();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [row, source, views] = await Promise.all([
    prisma.discoverySettings.findUnique({ where: { candidateId: candidate.id } }),
    loadProfileSource(candidate.id),
    prisma.discoveryView.findMany({
      where: { candidateId: candidate.id, viewedAt: { gte: since } },
      orderBy: { viewedAt: "desc" },
      take: 50,
      select: { id: true, companyName: true, jobTitle: true, viewedAt: true },
    }),
  ]);

  const settings: DiscoveryForm = row
    ? {
        enabled: row.enabled,
        includeHeadline: row.includeHeadline,
        includeSkills: row.includeSkills,
        includeAssessments: row.includeAssessments,
        includeSummary: row.includeSummary,
        includeRoles: row.includeRoles,
        includeBreak: row.includeBreak,
      }
    : DEFAULT_DISCOVERY;

  const preview = source ? buildSharedProfile(source, discoveryToShareSettings(settings)) : null;
  const previewName = row ? displayCode(row.code) : "Candidate (your code is assigned when you first save)";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Discoverability"
        description="Choose whether employers can find you, and exactly what they can see. It is off until you turn it on, and you can pause it at any time."
      >
        <Badge variant={settings.enabled ? "secondary" : "outline"}>
          {settings.enabled ? "Discoverable" : "Not discoverable"}
        </Badge>
      </PageHeader>

      {saved && <Notice tone="success">Saved.</Notice>}
      {error && <Notice tone="error">{errors[error] ?? "Something went wrong."}</Notice>}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" /> How discovery works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Only logged-in employers can search, and only from one of their own published jobs.</li>
            <li>
              You appear as {row ? displayCode(row.code) : "Candidate #CODE"}. Your name and email are never shown
              in search.
            </li>
            <li>Employers can only match you on the skills and passed tasks you choose to share below.</li>
            <li>
              Your career break is never a filter, a sort, or part of any comparison, and there is no field for a
              reason.
            </li>
            <li>
              An employer must send you an invitation. Your name and email are shared only if you accept it, and
              only with that employer.
            </li>
            <li>You can see every time an employer opens your listing.</li>
          </ul>
        </CardContent>
      </Card>

      <form action={saveDiscovery} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your settings</CardTitle>
            <CardDescription>Save to apply your changes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={settings.enabled}
                className="mt-0.5 size-4 accent-primary"
              />
              <span>
                <span className="font-medium">Let employers find me</span>
                <span className="block text-xs text-muted-foreground">
                  Switch this off at any time to disappear from search. Your choices below are kept.
                </span>
              </span>
            </label>

            <fieldset className="space-y-3">
              <legend className="mb-1 text-sm font-medium">What employers can see</legend>
              <ul className="space-y-3">
                {FIELDS.map((f) => (
                  <li key={f.key}>
                    <label className="flex items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        name={f.key}
                        defaultChecked={settings[f.key]}
                        className="mt-0.5 size-4 accent-primary"
                      />
                      <span>
                        {f.label}
                        <span className="block text-xs text-muted-foreground">{f.hint}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <Button type="submit">Save settings</Button>
          </CardContent>
        </Card>
      </form>

      {settings.enabled && !canBeMatched(settings) && (
        <Notice tone="warning">
          You are discoverable, but you share neither skills nor passed tasks, so a job search has nothing to match
          you on and you will not appear in results. Turn one of them on to be found.
        </Notice>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who opened your listing</CardTitle>
          <CardDescription>Employers who opened your listing from a job search in the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {views.length === 0 ? (
            <p className="text-sm text-muted-foreground">No one has opened your listing in the last 30 days.</p>
          ) : (
            <ul className="space-y-2">
              {views.map((v) => (
                <li key={v.id} className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{v.companyName}</p>
                    <p className="text-xs text-muted-foreground">for {v.jobTitle}</p>
                  </div>
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    {v.viewedAt.toLocaleString("en-GB")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      {preview && (
        <section className="space-y-2">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Eye className="size-4" aria-hidden="true" />
            {settings.enabled
              ? "Your listing: what an employer sees when they open you"
              : "If you turn discovery on, this is what an employer would see"}
          </p>
          <ProfileView profile={{ ...preview, name: previewName }} />
        </section>
      )}
    </div>
  );
}