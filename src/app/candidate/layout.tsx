import { auth } from "@/auth";
import { AppShell } from "@/components/shell/AppShell";
import { CANDIDATE_NAV } from "@/components/shell/nav";
import { candidateUnreadInvitations } from "@/lib/invitations/unread";

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const unread = userId ? await candidateUnreadInvitations(userId) : 0;

  return (
    <AppShell
      section="Build your evidence"
      items={CANDIDATE_NAV}
      badges={{ "/candidate/invitations": unread }}
      userName={session?.user?.name}
    >
      {children}
    </AppShell>
  );
}