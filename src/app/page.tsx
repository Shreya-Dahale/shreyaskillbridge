import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role === "CANDIDATE") redirect("/candidate");
  if (role === "EMPLOYER") redirect("/employer");
  redirect("/login");
}