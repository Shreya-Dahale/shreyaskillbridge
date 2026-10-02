import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { deleteCandidateSkill } from "@/app/actions/candidate";

const sourceLabel = {
  EXTRACTED: "From your resume",
  USER_EDITED: "Edited by you",
  USER_ADDED: "Added by you",
} as const;

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string }>;
}) {
  const { imported } = await searchParams;
  const profile = await requireCandidate();
  const skills = await prisma.candidateSkill.findMany({
    where: { candidateId: profile.id },
    include: { skill: true },
    orderBy: { skill: { name: "asc" } },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Your skills</h1>
      {imported && (
        <p className="rounded border border-green-300 p-3 text-sm text-green-800">
          Saved to your profile. Your roles and career break are on the profile page.
        </p>
      )}
      {skills.length === 0 && (
        <p className="text-sm text-gray-500">No skills yet. Upload a resume and import its skills.</p>
      )}
      <ul className="space-y-2">
        {skills.map((cs) => (
          <li key={cs.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">{cs.skill.name}</p>
              <p className="text-sm text-gray-500">
                {cs.yearsExperience != null ? `${cs.yearsExperience} yrs` : "Years not set"}
                {" · "}
                {cs.lastUsedYear != null ? `last used ${cs.lastUsedYear}` : "last used not set"}
                {" · "}
                {sourceLabel[cs.source]}
              </p>
            </div>
            <form action={deleteCandidateSkill}>
              <input type="hidden" name="id" value={cs.id} />
              <button className="text-sm text-red-600 underline">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}