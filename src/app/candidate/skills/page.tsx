import Link from "next/link";
import { Sparkles, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteCandidateSkill } from "@/app/actions/candidate";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";

const sourceLabel = {
  EXTRACTED: "From your resume",
  USER_EDITED: "Edited by you",
  USER_ADDED: "Added by you",
} as const;

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string }>;
}) {
  const { imported } = await searchParams;
  const profile = await requireCandidate();
  const skills = await prisma.candidateSkill.findMany({
    where: { candidateId: profile.id },
    include: { skill: true },
    orderBy: { skill: { name: "asc" } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Skills"
        description="The skills on your profile, with how long you have used them and where each came from."
      >
        <Link href="/candidate/resume" className={buttonVariants({ variant: "outline" })}>
          Import from a resume
        </Link>
      </PageHeader>

      {imported && (
        <Notice tone="success">Saved to your profile. Your roles and any career break are on the Profile page.</Notice>
      )}

      {skills.length === 0 ? (
        <EmptyState icon={Sparkles} title="No skills yet">
          Upload a resume and import its skills, and they will appear here.
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {skills.map((cs) => (
            <li key={cs.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{cs.skill.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cs.yearsExperience != null ? `${cs.yearsExperience} yrs` : "Years not set"} ·{" "}
                      {cs.lastUsedYear != null ? `last used ${cs.lastUsedYear}` : "last used not set"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={cs.source === "EXTRACTED" ? "secondary" : "outline"}>
                      {sourceLabel[cs.source]}
                    </Badge>
                    <form action={deleteCandidateSkill}>
                      <input type="hidden" name="id" value={cs.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${cs.skill.name}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}