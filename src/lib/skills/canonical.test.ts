import { describe, it, expect } from "vitest";
import { canonicalSkill } from "./canonical";

describe("canonicalSkill", () => {
  it("maps aliases to the canonical skill", () => {
    expect(canonicalSkill("REST API Design")).toEqual({ slug: "rest-apis", name: "REST APIs" });
    expect(canonicalSkill("RESTful APIs").name).toBe("REST APIs");
    expect(canonicalSkill("Java 17").name).toBe("Java");
    expect(canonicalSkill("Spring Framework").name).toBe("Spring");
    expect(canonicalSkill("SpringBoot").name).toBe("Spring Boot");
    expect(canonicalSkill("Postgres").name).toBe("PostgreSQL");
  });

  it("ignores case, spacing and trailing whitespace", () => {
    expect(canonicalSkill("  JAVA ").name).toBe("Java");
    expect(canonicalSkill("spring   boot").name).toBe("Spring Boot");
  });

  it("keeps Spring and Spring Boot as different skills", () => {
    expect(canonicalSkill("Spring").slug).not.toBe(canonicalSkill("Spring Boot").slug);
  });

  it("passes unknown skills through as typed", () => {
    expect(canonicalSkill("Postman")).toEqual({ slug: "postman", name: "Postman" });
  });
});