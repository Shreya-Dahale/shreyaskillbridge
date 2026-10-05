"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";
import { generateDiscoveryCode } from "@/lib/discovery/code";
import { hasAnySection, parseDiscoveryForm, type DiscoveryForm } from "@/lib/discovery/settings";

const PATH = "/candidate/discovery";

async function createSettings(candidateId: string, form: DiscoveryForm) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.discoverySettings.create({
        data: { candidateId, code: generateDiscoveryCode(), ...form },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        // Either the random code collided (try another), or settings were created a moment ago.
        const existing = await prisma.discoverySettings.findUnique({ where: { candidateId } });
        if (existing) return prisma.discoverySettings.update({ where: { candidateId }, data: form });
        continue;
      }
      throw e;
    }
  }
  throw new Error("Could not allocate a discovery code");
}

export async function saveDiscovery(formData: FormData) {
  const profile = await requireCandidate();
  const form = parseDiscoveryForm(formData);

  if (form.enabled && !hasAnySection(form)) redirect(`${PATH}?error=sections`);

  const existing = await prisma.discoverySettings.findUnique({
    where: { candidateId: profile.id },
    select: { id: true },
  });

  if (existing) {
    await prisma.discoverySettings.update({ where: { candidateId: profile.id }, data: form });
  } else {
    await createSettings(profile.id, form);
  }

  revalidatePath(PATH);
  redirect(`${PATH}?saved=1`);
}