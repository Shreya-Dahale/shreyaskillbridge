import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your evidence profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          This is a private preview of what an employer would see. Nothing is shared with anyone until you create
          a share link. Choose what to include, then press Update preview.
        </p>
      </div>

      <form method="get" className="space-y-3 rounded-lg border bg-white p-5 shadow-sm">
        <input type="hidden" name="preview" value="1" />
        <p className="font-medium">What to include</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {SETTING_FIELDS.map((f) => (
            <li key={f.key}>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name={f.key} defaultChecked={settings[f.key]} className="mt-1" />
                <span>
                  {f.label}
                  {f.hint && <span className="block text-xs text-gray-500">{f.hint}</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <button className="rounded bg-black px-4 py-2 text-sm text-white">Update preview</button>
      </form>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Preview: what an employer sees</p>
        <ProfileView profile={shared} />
      </div>
    </div>
  );
}