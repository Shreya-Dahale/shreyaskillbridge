import Link from "next/link";
import { ViewsChart } from "@/components/charts/ViewsChart";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";
import { bucketViewsByDay, summarizeViews, viewerLabel } from "@/lib/share/views";

const WINDOW_DAYS = 30;
const LIST_LIMIT = 100;

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

  const card = "rounded-lg border bg-white p-4 shadow-sm";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link href="/candidate/share" className="text-sm underline">
          &larr; Share your profile
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Who viewed your profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Views across all your links in the last {WINDOW_DAYS} days. Reloading a page within 10 minutes counts as
          one view, and your own visits are not counted.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={card}>
          <p className="text-2xl font-semibold">{summary.total}</p>
          <p className="text-xs text-gray-500">{summary.total === 1 ? "view" : "views"}</p>
        </div>
        <div className={card}>
          <p className="text-2xl font-semibold">{summary.companies.length}</p>
          <p className="text-xs text-gray-500">
            {summary.companies.length === 1 ? "company" : "companies"}
            {summary.anonymous > 0 && ` · ${summary.anonymous} without an account`}
          </p>
        </div>
        <div className={card}>
          <p className="text-2xl font-semibold">{activeLinks}</p>
          <p className="text-xs text-gray-500">active {activeLinks === 1 ? "link" : "links"}</p>
        </div>
      </div>

      <section className="space-y-3 rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Views per day</h2>
        <ViewsChart data={buckets} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent views</h2>
        {shown.length === 0 && (
          <p className="text-sm text-gray-500">
            No one has viewed your profile in the last {WINDOW_DAYS} days.
          </p>
        )}
        <ul className="space-y-2">
          {shown.map((v) => (
            <li key={v.id} className="flex items-start justify-between gap-3 rounded-lg border bg-white p-3 text-sm shadow-sm">
              <div>
                <p className="font-medium">{viewerLabel(v.viewerCompany)}</p>
                <p className="text-xs text-gray-500">via {v.shareLink.label ?? "Untitled link"}</p>
              </div>
              <p className="whitespace-nowrap text-xs text-gray-500">{v.viewedAt.toLocaleString("en-GB")}</p>
            </li>
          ))}
        </ul>
        {views.length > LIST_LIMIT && (
          <p className="text-xs text-gray-500">Showing the latest {LIST_LIMIT} views.</p>
        )}
      </section>
    </div>
  );
}