import { prisma } from "@/lib/db";

const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

/** Records that an employer opened a listing. Reloads within 10 minutes count once. */
export async function logDiscoveryView(input: {
  candidateId: string;
  employerId: string;
  companyName: string;
  jobTitle: string;
}) {
  const recent = await prisma.discoveryView.findFirst({
    where: {
      candidateId: input.candidateId,
      employerId: input.employerId,
      jobTitle: input.jobTitle,
      viewedAt: { gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
    },
    select: { id: true },
  });
  if (recent) return;

  await prisma.discoveryView.create({ data: input });
}