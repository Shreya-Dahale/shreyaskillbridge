import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileView } from "@/components/profile/ProfileView";
import { prisma } from "@/lib/db";
import { buildSharedProfile } from "@/lib/profile/build-profile";
import { loadProfileSource } from "@/lib/profile/load-source";
import { settingsFromLink } from "@/lib/profile/settings";
import { decideAccess } from "@/lib/share/access";
import { linkStatus } from "@/lib/share/status";
import { hashToken, isValidTokenFormat } from "@/lib/share/token";
import { Logo } from "@/components/shell/Logo";

export const metadata: Metadata = {
  title: "Shared evidence profile",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

export default async function SharedProfilePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const formatOk = isValidTokenFormat(token);

  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  const link = formatOk
    ? await prisma.shareLink.findUnique({
        where: { tokenHash: hashToken(token) },
        select: {
          id: true,
          candidateId: true,
          audience: true,
          showName: true,
          includeHeadline: true,
          includeSkills: true,
          includeAssessments: true,
          includeSummary: true,
          includeRoles: true,
          includeBreak: true,
          expiresAt: true,
          revokedAt: true,
          candidate: { select: { userId: true } },
        },
      })
    : null;

  const active = link !== null && linkStatus(link) === "ACTIVE";

  let viewer: { employerId: string; company: string } | null = null;
  if (user?.id && user.role === "EMPLOYER") {
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, companyName: true },
    });
    if (employer) viewer = { employerId: employer.id, company: employer.companyName };
  }

  const decision = decideAccess({
    linkActive: active,
    audience: link ? link.audience : null,
    loggedIn: Boolean(user?.id),
    isEmployer: viewer !== null,
  });

  if (decision === "LOGIN") {
    redirect(formatOk ? `/login?next=${encodeURIComponent(`/p/${token}`)}` : "/login");
  }
  if (decision === "HIDE" || !link) notFound();

  // Record the view. Reloads within 10 minutes count once, and the owner's own visits are not logged.
  const isOwner = user?.id === link.candidate.userId;
  if (!isOwner) {
    const recent = await prisma.shareView.findFirst({
      where: {
        shareLinkId: link.id,
        viewerEmployerId: viewer?.employerId ?? null,
        viewedAt: { gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
      },
      select: { id: true },
    });
    if (!recent) {
      await prisma.shareView.create({
        data: {
          shareLinkId: link.id,
          viewerEmployerId: viewer?.employerId ?? null,
          viewerCompany: viewer?.company ?? null,
        },
      });
    }
  }

  const source = await loadProfileSource(link.candidateId);
  if (!source) notFound();
  const shared = buildSharedProfile(source, settingsFromLink(link));

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 md:px-6">
          <Logo />
          <span className="text-xs text-muted-foreground">Shared evidence profile</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        <p className="text-sm text-muted-foreground">
          This profile was shared with you by the candidate, who chose exactly what it includes. It shows evidence
          of what they can do, alongside their experience. It is not a score or a hiring decision.
        </p>
        <ProfileView profile={shared} />
        <p className="text-xs text-muted-foreground">
          Contacting candidates through ReLaunch invitations is coming soon.
        </p>
      </main>
    </div>
  );
}