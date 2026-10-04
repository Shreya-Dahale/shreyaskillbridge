import { Building2, Eye, Link2, UserRound, type LucideIcon } from "lucide-react";
import { ViewsChart } from "@/components/charts/ViewsChart";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";
import { bucketViewsByDay, summarizeViews, viewerLabel } from "@/lib/share/views";

const WINDOW_DAYS = 30;
const LIST_LIMIT = 100;

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ActivityPage() {
  const profile = await requireCandidate();

  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [views, activeLinks] = await Promise.all([
    prisma.shareView.findMany({
      where: { shareLink: { candidateId: profile.id }, viewedAt: { gte: since } },
      orderBy: { viewedAt: "desc" },
      take: 1000,
      select: {
        id: true,
        viewedAt: true,
        viewerCompany: true,
        shareLink: { select: { label: true } },
      },
    }),
    prisma.shareLink.count({
      where: { candidateId: profile.id, revokedAt: null, expiresAt: { gt: now } },
    }),
  ]);

  const summary = summarizeViews(views);
  const buckets = bucketViewsByDay(
    views.map((v) => v.viewedAt),
    WINDOW_DAYS,
    now
  );
  const shown = views.slice(0, LIST_LIMIT);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Who viewed your profile"
        description={`Views across all your links in the last ${WINDOW_DAYS} days. Reloading a page within 10 minutes counts as one view, and your own visits are not counted.`}
        back={{ href: "/candidate/share", label: "Sharing" }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Eye} value={summary.total} label={summary.total === 1 ? "view" : "views"} />
        <Stat
          icon={Building2}
          value={summary.companies.length}
          label={`${summary.companies.length === 1 ? "company" : "companies"}${summary.anonymous > 0 ? ` · ${summary.anonymous} without an account` : ""}`}
        />
        <Stat icon={Link2} value={activeLinks} label={`active ${activeLinks === 1 ? "link" : "links"}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Views per day</CardTitle>
          <CardDescription>The last {WINDOW_DAYS} days.</CardDescription>
        </CardHeader>
        <CardContent>
          <ViewsChart data={buckets} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent views</h2>
        {shown.length === 0 ? (
          <EmptyState icon={Eye} title="No views yet">
            No one has viewed your profile in the last {WINDOW_DAYS} days.
          </EmptyState>
        ) : (
          <ul className="space-y-2">
            {shown.map((v) => (
              <li key={v.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {v.viewerCompany ? (
                          <Building2 className="size-4" aria-hidden="true" />
                        ) : (
                          <UserRound className="size-4" aria-hidden="true" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{viewerLabel(v.viewerCompany)}</p>
                        <p className="text-xs text-muted-foreground">via {v.shareLink.label ?? "Untitled link"}</p>
                      </div>
                    </div>
                    <p className="whitespace-nowrap text-xs text-muted-foreground">
                      {v.viewedAt.toLocaleString("en-GB")}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
        {views.length > LIST_LIMIT && (
          <p className="text-xs text-muted-foreground">Showing the latest {LIST_LIMIT} views.</p>
        )}
      </section>
    </div>
  );
}