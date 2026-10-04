import Link from "next/link";
import { CreateShareForm } from "@/components/share/CreateShareForm";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";
import { DEFAULT_SETTINGS, SETTING_FIELDS, includedLabels } from "@/lib/profile/settings";
import { revokeShareLink } from "@/app/actions/share";
import { AUDIENCE_LABEL, EXPIRY_OPTIONS, linkStatus, type LinkStatus } from "@/lib/share/status";

const STATUS_STYLE: Record<LinkStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  EXPIRED: "bg-gray-100 text-gray-700",
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
      <div>
        <h1 className="text-2xl font-semibold">Share your evidence profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Nothing is visible to anyone until you create a link. Each link has its own settings, its own expiry,
          and can be revoked at any time. You can{" "}
          <Link href="/candidate/evidence" className="underline">
            preview exactly what an employer will see
          </Link>{" "}
          first.
        </p>
      </div>

      <CreateShareForm
        fields={SETTING_FIELDS}
        defaults={DEFAULT_SETTINGS}
        expiryOptions={EXPIRY_OPTIONS.map((o) => ({ days: o.days, label: o.label }))}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your links</h2>
          <Link href="/candidate/share/activity" className="text-sm underline">
            See who viewed your profile
          </Link>
        </div>
        {links.length === 0 && <p className="text-sm text-gray-500">You have not created any links yet.</p>}
        <ul className="space-y-3">
          {links.map((link) => {
            const status = linkStatus(link, now);
            const last = link.views[0]?.viewedAt;
            return (
              <li key={link.id} className="space-y-2 rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{link.label ?? "Untitled link"}</p>
                    <p className="text-xs text-gray-500">
                      Created {link.createdAt.toLocaleDateString("en-GB")} · {AUDIENCE_LABEL[link.audience]} ·{" "}
                      {status === "REVOKED" && link.revokedAt
                        ? `revoked ${link.revokedAt.toLocaleDateString("en-GB")}`
                        : `${status === "EXPIRED" ? "expired" : "expires"} ${link.expiresAt.toLocaleDateString("en-GB")}`}
                    </p>
                  </div>
                  <span className={`whitespace-nowrap rounded px-2 py-1 text-xs ${STATUS_STYLE[status]}`}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <p className="text-sm text-gray-700">Includes: {includedLabels(link).join(", ") || "nothing"}</p>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-600">
                    {link._count.views} {link._count.views === 1 ? "view" : "views"}
                    {last && ` · last viewed ${last.toLocaleDateString("en-GB")}`}
                  </p>
                  {status === "ACTIVE" && (
                    <form action={revokeShareLink}>
                      <input type="hidden" name="id" value={link.id} />
                      <button className="text-red-600 underline">Revoke</button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}