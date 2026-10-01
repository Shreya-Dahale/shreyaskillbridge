import Link from "next/link";

export default function CandidateHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Candidate dashboard</h1>
      <Link href="/candidate/profile" className="inline-block rounded border px-4 py-2 underline">
        Edit your profile
      </Link>
    </div>
  );
}