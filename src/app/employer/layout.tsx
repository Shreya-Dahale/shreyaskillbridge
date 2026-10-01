import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <>
      <AppHeader title="Discover Evidence" name={session?.user?.name} />
      <div className="p-6">{children}</div>
    </>
  );
}