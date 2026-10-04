import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { analyzeResume, deleteResume, reextractResume, uploadResume } from "@/app/actions/resume";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";

const errors: Record<string, string> = {
  missing: "Please choose a PDF file.",
  size: "The file is too large. The limit is 5 MB.",
  type: "That doesn't look like a PDF. Please upload a PDF file.",
  notext: "No readable text was found in this resume, so it can't be analyzed.",
  ai: "The AI analysis failed. Please try again in a moment.",
};

function extractionStatus(text: string | null) {
  if (text === null) return { ok: false, label: "Text hasn't been extracted yet." };
  if (text.length < 100) {
    return {
      ok: false,
      label:
        "No readable text found. This may be a scanned PDF. Please upload a text-based PDF (for example, exported from Word or Google Docs).",
    };
  }
  return { ok: true, label: `${text.length.toLocaleString("en-GB")} characters extracted.` };
}

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const profile = await requireCandidate();
  const resumes = await prisma.resume.findMany({
    where: { candidateId: profile.id },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Resume"
        description="Upload a text-based PDF. AI reads it, and you review and correct everything before anything is saved to your profile."
      />

      {error && <Notice tone="error">{errors[error] ?? "Something went wrong."}</Notice>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload a resume</CardTitle>
          <CardDescription>PDF only, up to 5 MB. Only you can open the file.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={uploadResume} className="flex flex-col gap-2 sm:flex-row">
            <Input name="resume" type="file" accept="application/pdf" aria-label="Resume PDF" required />
            <Button type="submit">
              <Upload /> Upload
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Uploaded resumes</h2>
        {resumes.length === 0 ? (
          <EmptyState icon={FileText} title="Nothing uploaded yet">
            Upload a resume above to extract your roles and skills.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {resumes.map((r) => {
              const status = extractionStatus(r.extractedText);
              return (
                <li key={r.id}>
                  <Card>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                            <FileText className="size-5" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-sm font-medium">{r.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {(r.sizeBytes / 1024).toFixed(0)} KB · uploaded {r.uploadedAt.toLocaleDateString("en-GB")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={`/api/resume/${r.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                          >
                            <ExternalLink /> View
                          </a>
                          <form action={deleteResume}>
                            <input type="hidden" name="id" value={r.id} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 /> Delete
                            </Button>
                          </form>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 p-3 text-sm">
                        <p className={status.ok ? "flex items-center gap-2 text-green-700" : "flex items-center gap-2 text-amber-700"}>
                          {status.ok ? (
                            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                          ) : (
                            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                          )}
                          {status.label}
                        </p>
                        <form action={reextractResume}>
                          <input type="hidden" name="id" value={r.id} />
                          <Button type="submit" variant="outline" size="sm">
                            <RefreshCw /> Re-run extraction
                          </Button>
                        </form>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 p-3 text-sm">
                        <p className="text-muted-foreground">
                          {r.extractedAt
                            ? `AI analysis done on ${r.extractedAt.toLocaleString("en-GB")}`
                            : "Not analyzed yet."}
                        </p>
                        <div className="flex items-center gap-2">
                          {r.extractionJson != null && (
                            <Link href={`/candidate/review/${r.id}`} className={buttonVariants({ size: "sm" })}>
                              Review and import
                            </Link>
                          )}
                          <form action={analyzeResume}>
                            <input type="hidden" name="id" value={r.id} />
                            <Button type="submit" variant={r.extractionJson != null ? "outline" : "default"} size="sm">
                              <Sparkles /> {r.extractionJson != null ? "Analyze again" : "Analyze with AI"}
                            </Button>
                          </form>
                        </div>
                      </div>

                      {r.extractionJson != null && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground">View AI result (raw)</summary>
                          <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs">
                            {JSON.stringify(r.extractionJson, null, 2)}
                          </pre>
                        </details>
                      )}

                      {r.extractedText && r.extractedText.length > 0 && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground">Preview extracted text</summary>
                          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs">
                            {r.extractedText.slice(0, 1500)}
                          </pre>
                        </details>
                      )}
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