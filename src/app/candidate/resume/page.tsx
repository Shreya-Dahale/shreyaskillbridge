import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { uploadResume, deleteResume, reextractResume } from "@/app/actions/resume";

const errors: Record<string, string> = {
  missing: "Please choose a PDF file.",
  size: "The file is too large. The limit is 5 MB.",
  type: "That doesn't look like a PDF. Please upload a PDF file.",
};

function extractionStatus(text: string | null) {
  if (text === null) {
    return { ok: false, label: "Text hasn't been extracted yet." };
  }
  if (text.length < 100) {
    return {
      ok: false,
      label:
        "No readable text found. This may be a scanned PDF. Please upload a text-based PDF (for example, exported from Word or Google Docs).",
    };
  }
  return { ok: true, label: `${text.length.toLocaleString()} characters extracted.` };
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
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold">Your resume</h1>
      {error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">
          {errors[error] ?? "Something went wrong."}
        </p>
      )}

      <form action={uploadResume} className="space-y-3 rounded border p-4">
        <p className="text-sm font-medium">Upload a PDF (max 5 MB)</p>
        <input name="resume" type="file" accept="application/pdf" required />
        <div>
          <button className="rounded bg-black px-4 py-2 text-white">Upload</button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Uploaded resumes</h2>
        {resumes.length === 0 && (
          <p className="text-sm text-gray-500">Nothing uploaded yet.</p>
        )}
        <ul className="space-y-3">
          {resumes.map((r) => {
            const status = extractionStatus(r.extractedText);
            return (
              <li key={r.id} className="space-y-3 rounded border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {(r.sizeBytes / 1024).toFixed(0)} KB ·{" "}
                      {r.uploadedAt.toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <a
                      href={`/api/resume/${r.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      View
                    </a>
                    <form action={deleteResume}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-red-600 underline">Delete</button>
                    </form>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <p className={status.ok ? "text-green-700" : "text-amber-700"}>
                    {status.label}
                  </p>
                  <form action={reextractResume}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="whitespace-nowrap underline">Re-run extraction</button>
                  </form>
                </div>

                {r.extractedText && r.extractedText.length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer">Preview extracted text</summary>
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded border p-3 text-xs">
                      {r.extractedText.slice(0, 1500)}
                    </pre>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}