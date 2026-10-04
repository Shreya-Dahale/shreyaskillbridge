import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

const errors: Record<string, string> = {
  invalid: "Please check your details. The password needs at least 8 characters.",
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
    <AuthShell title="Create your account" subtitle="Free to start. You control what you share.">
      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{errors[error] ?? "Something went wrong."}</AlertDescription>
        </Alert>
      )}

      <RegisterForm />

      <p className="text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}