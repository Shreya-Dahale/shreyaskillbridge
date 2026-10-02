import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Spring Boot")).toBe("spring-boot");
    expect(slugify("REST APIs")).toBe("rest-apis");
  });

  it("keeps characters that matter in tech names", () => {
    expect(slugify("C++")).toBe("c++");
    expect(slugify("C#")).toBe("c#");
    expect(slugify("  Node.js ")).toBe("node.js");
  });

  it("returns an empty string for junk", () => {
    expect(slugify("!!!")).toBe("");
  });
});