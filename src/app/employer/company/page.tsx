import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCompany } from "@/app/actions/employer";
import { requireEmployer } from "@/lib/employer";

const errors: Record<string, string> = {
  invalid: "Please enter a company name (up to 100 characters). The description can be up to 1000.",
  website: "That doesn't look like a valid website address, for example https://example.com.",
};

export default async function CompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const profile = await requireEmployer();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Company"
        description="Candidates see this information on your job postings."
      />

      {saved && <Notice tone="success">Saved.</Notice>}
      {error && <Notice tone="error">{errors[error] ?? "Something went wrong."}</Notice>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company profile</CardTitle>
          <CardDescription>Only the company name is required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCompany} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" name="companyName" defaultValue={profile.companyName} maxLength={100} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                defaultValue={profile.website ?? ""}
                placeholder="https://example.com"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">About your company</Label>
              <Textarea id="about" name="about" defaultValue={profile.about ?? ""} rows={5} maxLength={1000} />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}