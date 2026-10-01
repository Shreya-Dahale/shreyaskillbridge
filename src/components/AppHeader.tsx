import { logout } from "@/app/actions/auth";

export function AppHeader({ title, name }: { title: string; name?: string | null }) {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <span className="font-semibold">ReLaunch · {title}</span>
      <form action={logout} className="flex items-center gap-3 text-sm">
        <span>{name}</span>
        <button className="rounded border px-3 py-1">Log out</button>
      </form>
    </header>
  );
}