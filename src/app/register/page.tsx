import Link from "next/link";
import { register } from "@/app/actions/auth";

const errors: Record<string, string> = {
  invalid: "Please check your details (password needs 8+ characters).",
  exists: "An account with this email already exists.",
  company: "Employers must enter a company name.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto mt-20 max-w-sm space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      {error && <p className="text-sm text-red-600">{errors[error] ?? "Something went wrong."}</p>}
      <form action={register} className="space-y-3">
        <input name="name" placeholder="Full name" required className="w-full rounded border p-2" />
        <input name="email" type="email" placeholder="Email" required className="w-full rounded border p-2" />
        <input name="password" type="password" placeholder="Password (8+ chars)" required className="w-full rounded border p-2" />
        <select name="role" className="w-full rounded border p-2" defaultValue="CANDIDATE">
          <option value="CANDIDATE">I'm a candidate returning to work</option>
          <option value="EMPLOYER">I'm an employer</option>
        </select>
        <input name="companyName" placeholder="Company name (employers only)" className="w-full rounded border p-2" />
        <button className="w-full rounded bg-black p-2 text-white">Sign up</button>
      </form>
      <p className="text-sm">
        Already registered? <Link href="/register" className="underline">Log in</Link>
      </p>
    </main>
  );
}