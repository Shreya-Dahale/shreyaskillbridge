import Link from "next/link";

export default function EmployerHome() {
  const link = "rounded border px-4 py-2 underline";
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Employer dashboard</h1>
      <div className="flex flex-wrap gap-3">
        <Link href="/employer/company" className={link}>
          Company profile
        </Link>
        <Link href="/employer/jobs" className={link}>
          Your jobs
        </Link>
      </div>
    </div>
  );
}