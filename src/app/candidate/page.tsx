import Link from "next/link";

export default function CandidateHome() {
  const link = "rounded border px-4 py-2 underline";
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Candidate dashboard</h1>
      <div className="flex flex-wrap gap-3">
        <Link href="/candidate/profile" className={link}>
          Edit your profile
        </Link>
        <Link href="/candidate/resume" className={link}>
          Upload your resume
        </Link>
        <Link href="/candidate/skills" className={link}>
          Your skills
        </Link>
        <Link href="/candidate/jobs" className={link}>
          Find jobs
        </Link>
      </div>
    </div>
  );
}