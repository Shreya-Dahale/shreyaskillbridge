import { requireEmployer } from "@/lib/employer";
import { updateCompany } from "@/app/actions/employer";

const errors: Record<string, string> = {
  invalid: "Please enter a company name (up to 100 characters). The description can be up to 1000.",
  website: "That doesn't look like a valid website address, for example https://example.com.",
};

const input = "w-full rounded border p-2";

export default async function CompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const profile = await requireEmployer();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Company profile</h1>
      <p className="text-sm text-gray-600">
        Candidates will see this information on your job postings.
      </p>

      {saved && (
        <p className="rounded border border-green-300 p-3 text-sm text-green-800">Saved.</p>
      )}
      {error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">
          {errors[error] ?? "Something went wrong."}
        </p>
      )}

      <form action={updateCompany} className="space-y-4">
        <label className="block text-sm font-medium">
          Company name
          <input
            name="companyName"
            defaultValue={profile.companyName}
            required
            maxLength={100}
            className={`${input} mt-1`}
          />
        </label>
        <label className="block text-sm font-medium">
          Website (optional)
          <input
            name="website"
            defaultValue={profile.website ?? ""}
            placeholder="https://example.com"
            maxLength={200}
            className={`${input} mt-1`}
          />
        </label>
        <label className="block text-sm font-medium">
          About your company (optional)
          <textarea
            name="about"
            defaultValue={profile.about ?? ""}
            rows={5}
            maxLength={1000}
            className={`${input} mt-1`}
          />
        </label>
        <button className="rounded bg-black px-4 py-2 text-white">Save</button>
      </form>
    </div>
  );
}