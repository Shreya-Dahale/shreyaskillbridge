/** Turns a skill name into a stable lookup key: "Spring Boot" -> "spring-boot". */
export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9+#.\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}