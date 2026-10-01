"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { saveFile, deleteFile } from "@/lib/storage";

const PATH = "/candidate/resume";
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadResume(formData: FormData) {
  const profile = await requireCandidate();

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) redirect(`${PATH}?error=missing`);
  if (file.size > MAX_BYTES) redirect(`${PATH}?error=size`);

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    redirect(`${PATH}?error=type`);
  }

  const storagePath = await saveFile("resumes", buffer, ".pdf");
  await prisma.resume.create({
    data: {
      candidateId: profile.id,
      fileName: file.name.slice(0, 200),
      storagePath,
      sizeBytes: file.size,
    },
  });
  revalidatePath(PATH);
}

export async function deleteResume(formData: FormData) {
  const profile = await requireCandidate();
  const id = String(formData.get("id") ?? "");

  const resume = await prisma.resume.findFirst({
    where: { id, candidateId: profile.id },
  });
  if (!resume) return;

  await prisma.resume.delete({ where: { id: resume.id } });
  await deleteFile(resume.storagePath);
  revalidatePath(PATH);
}