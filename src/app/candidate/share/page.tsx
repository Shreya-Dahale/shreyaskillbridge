import Link from "next/link";
import { Eye, Link2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { CreateShareForm } from "@/components/share/CreateShareForm";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { revokeShareLink } from "@/app/actions/share";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";
import { DEFAULT_SETTINGS, SETTING_FIELDS, includedLabels } from "@/lib/profile/settings";
import { AUDIENCE_LABEL, EXPIRY_OPTIONS, linkStatus, type LinkStatus } from "@/lib/share/status";

const STATUS_STYLE: Record<LinkStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  EXPIRED: "bg-muted text-muted-foreground",
  REVOKED: "bg-red-100 text-red-800",
};
const STATUS_LABEL: Record<LinkStatus, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

export default async function SharePage() {
  const profile = await requireCandidate();

  const links = await prisma.shareLink.findMany({
    where: { candidateId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      label: true,
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
      createdAt: true,
      _count: { select: { views: true } },
      views: { orderBy: { viewedAt: "desc" }, take: 1, select: { viewedAt: true } },
    },
  });

  const now = new Date();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Sharing"
        description="Nothing is visible to anyone until you create a link. Each link has its own settings and expiry, and can be revoked at any time."
      >
        <Link href="/candidate/evidence" className={buttonVariants({ variant: "outline" })}>
          Preview your profile
        </Link>
      </PageHeader>

      <CreateShareForm
        fields={SETTING_FIELDS}
        defaults={DEFAULT_SETTINGS}
        expiryOptions={EXPIRY_OPTIONS.map((o) => ({ days: o.days, label: o.label }))}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Your links</h2>
          <Link
            href="/candidate/share/activity"
            className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
          >
            <Eye className="size-4" aria-hidden="true" /> See who viewed your profile
          </Link>
        </div>

        {links.length === 0 ? (
          <EmptyState icon={Link2} title="No links yet">
            Create your first link above. You will see it here, with its views.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {links.map((link) => {
              const status = linkStatus(link, now);
              const last = link.views[0]?.viewedAt;
              const labels = includedLabels(link);
              return (
                <li key={link.id}>
                  <Card>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{link.label ?? "Untitled link"}</p>
                          <p className="text-xs text-muted-foreground">
                            Created {link.createdAt.toLocaleDateString("en-GB")} · {AUDIENCE_LABEL[link.audience]} ·{" "}
                            {status === "REVOKED" && link.revokedAt
                              ? `revoked ${link.revokedAt.toLocaleDateString("en-GB")}`
                              : `${status === "EXPIRED" ? "expired" : "expires"} ${link.expiresAt.toLocaleDateString("en-GB")}`}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[status]}`}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {labels.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Includes nothing</span>
                        ) : (
                          labels.map((label) => (
                            <Badge key={label} variant="secondary">
                              {label}
                            </Badge>
                          ))
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <Eye className="size-4" aria-hidden="true" />
                          {link._count.views} {link._count.views === 1 ? "view" : "views"}
                          {last && ` · last viewed ${last.toLocaleDateString("en-GB")}`}
                        </p>
                        {status === "ACTIVE" && (
                          <form action={revokeShareLink}>
                            <input type="hidden" name="id" value={link.id} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              Revoke
                            </Button>
                          </form>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}