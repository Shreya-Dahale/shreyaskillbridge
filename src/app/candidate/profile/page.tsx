import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import {
  updateHeadline,
  addCareerHistory,
  deleteCareerHistory,
  addCareerBreak,
  deleteCareerBreak,
} from "@/app/actions/candidate";

const errors: Record<string, string> = {
  dates: "Please check the dates. The end date can't be before the start date.",
  invalid: "Please fill in the required fields.",
};

function fmt(d: Date | null, empty: string) {
  if (!d) return empty;
  return d.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const base = await requireCandidate();
  const profile = await prisma.candidateProfile.findUniqueOrThrow({
    where: { id: base.id },
    include: {
      careerHistory: { orderBy: { startDate: "desc" } },
      careerBreaks: { orderBy: { startDate: "desc" } },
    },
  });

  const input = "w-full rounded border p-2";
  const button = "rounded bg-black px-4 py-2 text-white";

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <h1 className="text-2xl font-semibold">Your profile</h1>
      {error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">
          {errors[error] ?? "Something went wrong."}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Headline</h2>
        <form action={updateHeadline} className="flex gap-2">
          <input
            name="headline"
            defaultValue={profile.headline ?? ""}
            placeholder="e.g. Java developer returning after a career break"
            maxLength={140}
            className={input}
          />
          <button className={button}>Save</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Career history</h2>
        {profile.careerHistory.length === 0 && (
          <p className="text-sm text-gray-500">No roles added yet.</p>
        )}
        <ul className="space-y-3">
          {profile.careerHistory.map((job) => (
            <li key={job.id} className="flex items-start justify-between rounded border p-3">
              <div>
                <p className="font-medium">
                  {job.jobTitle} · {job.company}
                </p>
                <p className="text-sm text-gray-500">
                  {fmt(job.startDate, "")} – {fmt(job.endDate, "Present")}
                </p>
                {job.description && <p className="mt-1 text-sm">{job.description}</p>}
              </div>
              <form action={deleteCareerHistory}>
                <input type="hidden" name="id" value={job.id} />
                <button className="text-sm text-red-600 underline">Delete</button>
              </form>
            </li>
          ))}
        </ul>

        <form action={addCareerHistory} className="space-y-2 rounded border p-3">
          <p className="text-sm font-medium">Add a role</p>
          <input name="jobTitle" placeholder="Job title" required className={input} />
          <input name="company" placeholder="Company" required className={input} />
          <div className="flex gap-2">
            <label className="flex-1 text-sm">
              Start date
              <input name="startDate" type="date" required className={input} />
            </label>
            <label className="flex-1 text-sm">
              End date (blank if current)
              <input name="endDate" type="date" className={input} />
            </label>
          </div>
          <textarea
            name="description"
            placeholder="What did you work on? (optional)"
            rows={3}
            className={input}
          />
          <button className={button}>Add role</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Career break</h2>
        <p className="text-sm text-gray-500">
          We only ask for dates. You never need to explain the reason.
        </p>
        <ul className="space-y-3">
          {profile.careerBreaks.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded border p-3">
              <p className="text-sm">
                {fmt(b.startDate, "")} – {fmt(b.endDate, "Ongoing")}
              </p>
              <form action={deleteCareerBreak}>
                <input type="hidden" name="id" value={b.id} />
                <button className="text-sm text-red-600 underline">Delete</button>
              </form>
            </li>
          ))}
        </ul>

        <form action={addCareerBreak} className="space-y-2 rounded border p-3">
          <p className="text-sm font-medium">Add a career break</p>
          <div className="flex gap-2">
            <label className="flex-1 text-sm">
              Start date
              <input name="startDate" type="date" required className={input} />
            </label>
            <label className="flex-1 text-sm">
              End date (blank if ongoing)
              <input name="endDate" type="date" className={input} />
            </label>
          </div>
          <button className={button}>Add break</button>
        </form>
      </section>
    </div>
  );
}