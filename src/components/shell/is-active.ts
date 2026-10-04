/** A link is active on its own page and on every page beneath it. The dashboard link matches exactly. */
export function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}