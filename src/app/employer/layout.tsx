import { auth } from "@/auth";
import { AppShell } from "@/components/shell/AppShell";
import { EMPLOYER_NAV } from "@/components/shell/nav";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <AppShell section="Discover evidence" items={EMPLOYER_NAV} userName={session?.user?.name}>
      {children}
    </AppShell>
  );
}