"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/auth";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["CANDIDATE", "EMPLOYER"]),
  companyName: z.string().optional(),
});

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/register?error=invalid");
  const { name, password, role, companyName } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  if (await prisma.user.findUnique({ where: { email } })) {
    redirect("/register?error=exists");
  }
  if (role === "EMPLOYER" && !companyName) redirect("/register?error=company");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      ...(role === "CANDIDATE"
        ? { candidate: { create: {} } }
        : { employer: { create: { companyName: companyName! } } }),
    },
  });

  await signIn("credentials", { email, password, redirectTo: "/" });
}

export async function login(formData: FormData) {
  const next = String(formData.get("next") ?? "");
  const validNext = /^\/p\/[A-Za-z0-9_-]{43}$/.test(next) ? next : null;

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: validNext ?? "/",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      redirect(validNext ? `/login?error=1&next=${encodeURIComponent(validNext)}` : "/login?error=1");
    }
    throw e;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}