import Link from "next/link";
import { redirect } from "next/navigation";
import { Share2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ProfileView } from "@/components/profile/ProfileView";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCandidate } from "@/lib/candidate";
import { buildSharedProfile } from "@/lib/profile/build-profile";
import { loadProfileSource } from "@/lib/profile/load-source";
import { SETTING_FIELDS, settingsFromSearchParams } from "@/lib/profile/settings";

export default async function EvidencePreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const settings = settingsFromSearchParams(params);

  const candidate = await requireCandidate();
  const source = await loadProfileSource(candidate.id);
  if (!source) redirect("/login");

  const shared = buildSharedProfile(source, settings);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your evidence profile"
        description="A private preview of what an employer would see. Nothing is shared with anyone until you create a share link."
      >
        <Link href="/candidate/share" className={buttonVariants()}>
          <Share2 /> Create a share link
        </Link>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[18rem_1fr] xl:items-start">
        <form method="get" className="xl:sticky xl:top-24">
          <input type="hidden" name="preview" value="1" />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What to include</CardTitle>
              <CardDescription>Tick the sections, then update the preview.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {SETTING_FIELDS.map((f) => (
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
                        {f.hint && <span className="block text-xs text-muted-foreground">{f.hint}</span>}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <Button type="submit" className="w-full">
                Update preview
              </Button>
            </CardContent>
          </Card>
        </form>

        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Preview: what an employer sees
          </p>
          <ProfileView profile={shared} />
        </div>
      </div>
    </div>
  );
}