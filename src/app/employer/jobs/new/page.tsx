import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createJob } from "@/app/actions/jobs";
import { requireEmployer } from "@/lib/employer";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  await requireEmployer();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New job"
        description="Paste the full job description. In the next step the AI suggests the required and preferred skills, and you review them before anything is published."
        back={{ href: "/employer/jobs", label: "All jobs" }}
      />

      {error && (
        <Notice tone="error">
          Please enter a job title and a description of at least 50 characters (up to 10,000).
        </Notice>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job details</CardTitle>
          <CardDescription>The job starts as a draft. Candidates cannot see it until you publish it.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createJob} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job title</Label>
              <Input id="title" name="title" maxLength={100} placeholder="e.g. Java Backend Developer" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Job description</Label>
              <Textarea
                id="description"
                name="description"
                rows={14}
                minLength={50}
                maxLength={10000}
                placeholder="Paste the job description here"
                required
              />
            </div>
            <Button type="submit">Create job</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}