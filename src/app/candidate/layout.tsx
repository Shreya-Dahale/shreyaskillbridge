import { auth } from "@/auth";
import { AppShell } from "@/components/shell/AppShell";
import { CANDIDATE_NAV } from "@/components/shell/nav";

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <AppShell section="Build your evidence" items={CANDIDATE_NAV} userName={session?.user?.name}>
      {children}
    </AppShell>
  );
}