import Link from "next/link";

export default function CandidateHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Candidate dashboard</h1>
      <div className="flex gap-3">
        <Link href="/candidate/profile" className="rounded border px-4 py-2 underline">
          Edit your profile
        </Link>
        <Link href="/candidate/resume" className="rounded border px-4 py-2 underline">
          Upload your resume
        </Link>
      </div>
    </div>
  );
}