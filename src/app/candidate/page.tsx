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
        <Link href="/candidate/tasks" className={link}>
          Practice tasks
        </Link>
        <Link href="/candidate/evidence" className={link}>
          Your evidence profile
        </Link>
        <Link href="/candidate/share" className={link}>
          Share your profile
        </Link>
      </div>
    </div>
  );
}