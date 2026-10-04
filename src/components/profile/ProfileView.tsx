import { StatusBar } from "@/components/charts/StatusBar";
import { formatDate, formatMonthYear } from "@/lib/profile/format";
import type { SharedProfile } from "@/lib/profile/types";
import { STATUS_LABEL, STATUS_STYLE } from "@/lib/skills/describe";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** Renders a shared profile. It can only show what the builder put in. */
export function ProfileView({ profile }: { profile: SharedProfile }) {
  return (
    <div className="space-y-5">
      <header className="rounded-lg border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">{profile.name}</h1>
        {profile.headline && <p className="mt-1 text-gray-600">{profile.headline}</p>}
      </header>

      {profile.summary && (
        <Section title="Summary">
          <p className="text-sm leading-relaxed text-gray-700">{profile.summary}</p>
        </Section>
      )}

      {profile.skills && (
        <Section title="Skills">
          {profile.skills.length === 0 ? (
            <p className="text-sm text-gray-500">No skills to show yet.</p>
          ) : (
            <>
              <StatusBar statuses={profile.skills.map((s) => s.status)} />
              <ul className="space-y-2">
                {profile.skills.map((s) => (
                  <li key={s.name} className="flex items-start justify-between gap-3 rounded border p-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-gray-500">
                        {s.yearsSelfReported != null
                          ? `${s.yearsSelfReported} yrs, self-reported`
                          : "No years listed"}
                        {s.lastUsedYear != null && ` · last used ${s.lastUsedYear}`}
                      </p>
                    </div>
                    <span className={`whitespace-nowrap rounded px-2 py-1 text-xs ${STATUS_STYLE[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>
      )}

      {profile.assessments && (
        <Section title="Passed practice tasks">
          {profile.assessments.length === 0 ? (
            <p className="text-sm text-gray-500">No practice tasks passed yet.</p>
          ) : (
            <ul className="space-y-2">
              {profile.assessments.map((a) => (
                <li key={a.taskTitle} className="rounded border p-3">
                  <p className="font-medium">{a.taskTitle}</p>
                  <p className="text-xs text-gray-500">
                    Evidence for {a.skills.join(", ")} · most recent pass {formatDate(a.passedOn)} ·{" "}
                    {a.attempts === 1 ? "first pass on the first attempt" : `first pass on attempt ${a.attempts}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {profile.roles && (
        <Section title="Roles">
          {profile.roles.length === 0 ? (
            <p className="text-sm text-gray-500">No roles listed.</p>
          ) : (
            <ul className="space-y-2">
              {profile.roles.map((r) => (
                <li key={`${r.jobTitle}-${r.company}-${r.startDate.toISOString()}`} className="rounded border p-3">
                  <p className="font-medium">
                    {r.jobTitle} · {r.company}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatMonthYear(r.startDate)} – {r.endDate ? formatMonthYear(r.endDate) : "present"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {profile.careerBreaks && (
        <Section title="Career break">
          {profile.careerBreaks.length === 0 ? (
            <p className="text-sm text-gray-500">No career break listed.</p>
          ) : (
            <ul className="space-y-2">
              {profile.careerBreaks.map((b) => (
                <li key={b.startDate.toISOString()} className="rounded border p-3 text-sm">
                  {formatMonthYear(b.startDate)} – {b.endDate ? formatMonthYear(b.endDate) : "ongoing"}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {profile.notices.length > 0 && (
        <aside className="space-y-1 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
          <p className="font-medium">How to read this profile</p>
          <ul className="list-disc space-y-1 pl-4">
            {profile.notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p className="pt-1 text-gray-500">Generated {formatDate(profile.generatedAt)}.</p>
        </aside>
      )}
    </div>
  );
}