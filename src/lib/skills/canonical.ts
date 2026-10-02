import { TAXONOMY_SKILLS } from "./taxonomy";
import { slugify } from "./slug";

export type CanonicalSkill = { slug: string; name: string };

const index = new Map<string, CanonicalSkill>();

// Canonical names first, so an alias can never shadow a real skill.
for (const s of TAXONOMY_SKILLS) {
  const slug = slugify(s.name);
  index.set(slug, { slug, name: s.name });
}
for (const s of TAXONOMY_SKILLS) {
  const canonical = index.get(slugify(s.name))!;
  for (const alias of s.aliases) {
    const key = slugify(alias);
    if (key && !index.has(key)) index.set(key, canonical);
  }
}

/** Maps any typed skill name to its canonical skill. Unknown names stay as typed. */
export function canonicalSkill(input: string): CanonicalSkill {
  const slug = slugify(input);
  return index.get(slug) ?? { slug, name: input.trim() };
}