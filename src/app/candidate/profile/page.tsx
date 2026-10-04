import { CalendarRange, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addCareerBreak,
  addCareerHistory,
  deleteCareerBreak,
  deleteCareerHistory,
  updateHeadline,
} from "@/app/actions/candidate";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";
import { formatMonthYear } from "@/lib/profile/format";

const errors: Record<string, string> = {
  dates: "Please check the dates. The end date can't be before the start date.",
  invalid: "Please fill in the required fields.",
};

function DateFields({ prefix, endLabel }: { prefix: string; endLabel: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-start`}>Start date</Label>
        <Input id={`${prefix}-start`} name="startDate" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-end`}>{endLabel}</Label>
        <Input id={`${prefix}-end`} name="endDate" type="date" />
      </div>
    </div>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const base = await requireCandidate();
  const profile = await prisma.candidateProfile.findUniqueOrThrow({
    where: { id: base.id },
    include: {
      careerHistory: { orderBy: { startDate: "desc" } },
      careerBreaks: { orderBy: { startDate: "desc" } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Profile"
        description="Your headline, roles and any career break. This is the history your skills are compared from."
      />

      {error && <Notice tone="error">{errors[error] ?? "Something went wrong."}</Notice>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Headline</CardTitle>
          <CardDescription>One line shown at the top of your evidence profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateHeadline} className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="headline"
              aria-label="Headline"
              defaultValue={profile.headline ?? ""}
              placeholder="e.g. Java developer returning after a career break"
              maxLength={140}
            />
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Career history</CardTitle>
          <CardDescription>The roles you have held.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.careerHistory.length === 0 ? (
            <EmptyState icon={CalendarRange} title="No roles added yet">
              Add a role below, or import them from your resume.
            </EmptyState>
          ) : (
            <ul className="space-y-2">
              {profile.careerHistory.map((job) => (
                <li key={job.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {job.jobTitle} · {job.company}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatMonthYear(job.startDate)} – {job.endDate ? formatMonthYear(job.endDate) : "Present"}
                    </p>
                    {job.description && <p className="mt-1 text-sm text-muted-foreground">{job.description}</p>}
                  </div>
                  <form action={deleteCareerHistory}>
                    <input type="hidden" name="id" value={job.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 /> Delete
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a role</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addCareerHistory} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job title</Label>
                <Input id="jobTitle" name="jobTitle" maxLength={100} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" maxLength={100} required />
              </div>
            </div>
            <DateFields prefix="role" endLabel="End date (blank if current)" />
            <div className="space-y-2">
              <Label htmlFor="description">What did you work on? (optional)</Label>
              <Textarea id="description" name="description" rows={3} maxLength={2000} />
            </div>
            <Button type="submit">
              <Plus /> Add role
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Career break</CardTitle>
          <CardDescription>
            We only ask for dates. You never need to explain the reason, and it is never part of a skill comparison.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.careerBreaks.length > 0 && (
            <ul className="space-y-2">
              {profile.careerBreaks.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <p className="text-sm">
                    {formatMonthYear(b.startDate)} – {b.endDate ? formatMonthYear(b.endDate) : "Ongoing"}
                  </p>
                  <form action={deleteCareerBreak}>
                    <input type="hidden" name="id" value={b.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 /> Delete
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <form action={addCareerBreak} className="space-y-4 rounded-lg border p-4">
            <p className="text-sm font-medium">Add a career break</p>
            <DateFields prefix="break" endLabel="End date (blank if ongoing)" />
            <Button type="submit" variant="outline">
              <Plus /> Add break
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}