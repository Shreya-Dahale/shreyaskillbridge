import Link from "next/link";
import { login } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto mt-20 max-w-sm space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Log in to ReLaunch</h1>
      {error && <p className="text-sm text-red-600">Invalid email or password.</p>}
      <form action={login} className="space-y-3">
        <input name="email" type="email" placeholder="Email" required className="w-full rounded border p-2" />
        <input name="password" type="password" placeholder="Password" required className="w-full rounded border p-2" />
        <button className="w-full rounded bg-black p-2 text-white">Log in</button>
      </form>
      <p className="text-sm">
        New here? <Link href="/register" className="underline">Create an account</Link>
      </p>
    </main>
  );
}