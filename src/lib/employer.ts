import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function requireEmployer() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "EMPLOYER") redirect("/login");

  const profile = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) redirect("/login");

  return profile;
}