import { describe, it, expect } from "vitest";
import { TAXONOMY_SKILLS, TAXONOMY_RELATIONS } from "./taxonomy";
import { slugify } from "./slug";

describe("taxonomy integrity", () => {
  const canonicalSlugs = TAXONOMY_SKILLS.map((s) => slugify(s.name));

  it("has unique canonical skills", () => {
    expect(new Set(canonicalSlugs).size).toBe(canonicalSlugs.length);
  });

  it("never reuses an alias, and no alias shadows a canonical skill", () => {
    const seen = new Set<string>();
    for (const s of TAXONOMY_SKILLS) {
      for (const alias of s.aliases) {
        const key = slugify(alias);
        expect(key, `empty alias for ${s.name}`).not.toBe("");
        expect(canonicalSlugs, `alias "${alias}" shadows a skill`).not.toContain(key);
        expect(seen.has(key), `alias "${alias}" is used twice`).toBe(false);
        seen.add(key);
      }
    }
  });

  it("only relates skills that exist, never a skill to itself", () => {
    for (const r of TAXONOMY_RELATIONS) {
      expect(canonicalSlugs, `unknown skill ${r.from}`).toContain(slugify(r.from));
      expect(canonicalSlugs, `unknown skill ${r.to}`).toContain(slugify(r.to));
      expect(slugify(r.from)).not.toBe(slugify(r.to));
    }
  });

  it("has no duplicate relations", () => {
    const keys = TAXONOMY_RELATIONS.map((r) => `${slugify(r.from)}>${slugify(r.to)}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});