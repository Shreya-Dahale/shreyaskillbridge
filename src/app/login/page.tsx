import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { login } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue building your evidence.">
      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>Invalid email or password.</AlertDescription>
        </Alert>
      )}

      <form action={login} className="space-y-4">
        <input type="hidden" name="next" value={next ?? ""} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <Button type="submit" className="w-full">
          Log in
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        New to ReLaunch?{" "}
        <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}