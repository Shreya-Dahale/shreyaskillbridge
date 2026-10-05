import { auth } from "@/auth";
import { AppShell } from "@/components/shell/AppShell";
import { EMPLOYER_NAV } from "@/components/shell/nav";
import { employerUnreadResponses } from "@/lib/invitations/unread";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const unread = userId ? await employerUnreadResponses(userId) : 0;

  return (
    <AppShell
      section="Discover evidence"
      items={EMPLOYER_NAV}
      badges={{ "/employer/invitations": unread }}
      userName={session?.user?.name}
    >
      {children}
    </AppShell>
  );
}