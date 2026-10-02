"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";

const PATH = "/employer/company";

const companySchema = z.object({
  companyName: z.string().trim().min(1).max(100),
  website: z.string().trim().max(200).optional(),
  about: z.string().trim().max(1000).optional(),
});

function normalizeWebsite(raw: string | undefined): string | null | "invalid" {
  if (!raw) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "invalid";
    if (!url.hostname.includes(".")) return "invalid";
    return url.toString();
  } catch {
    return "invalid";
  }
}

export async function updateCompany(formData: FormData) {
  const profile = await requireEmployer();

  const parsed = companySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${PATH}?error=invalid`);

  const website = normalizeWebsite(parsed.data.website);
  if (website === "invalid") redirect(`${PATH}?error=website`);

  await prisma.employerProfile.update({
    where: { id: profile.id },
    data: {
      companyName: parsed.data.companyName,
      website,
      about: parsed.data.about || null,
    },
  });

  revalidatePath(PATH);
  redirect(`${PATH}?saved=1`);
}