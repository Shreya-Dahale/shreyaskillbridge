import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";
import { z } from "zod";
import { resumeExtractionSchema } from "../src/lib/ai/schemas";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

function clean(node: unknown, drop: string[]): unknown {
  if (Array.isArray(node)) return node.map((n) => clean(n, drop));
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (drop.includes(key)) continue;
      out[key] = clean(value, drop);
    }
    return out;
  }
  return node;
}

async function attempt(label: string, config: GenerateContentConfig) {
  try {
    await ai.models.generateContent({
      model,
      contents: "Aditi Sharma, Java Developer at Acme, Sep 2019 - Aug 2021. Used Java and MySQL.",
      config,
    });
    console.log(`PASS  ${label}`);
  } catch (e) {
    console.log(`FAIL  ${label}:`, e instanceof Error ? e.message : e);
  }
}

async function main() {
  console.log("model:", model);
  const raw = z.toJSONSchema(resumeExtractionSchema);

  await attempt("1. plain text, no config", {});
  await attempt("2. JSON mime type only", { responseMimeType: "application/json" });
  await attempt("3. raw Zod schema", {
    responseMimeType: "application/json",
    responseJsonSchema: raw,
  });
  await attempt("4. schema minus $schema, additionalProperties, minimum, maximum", {
    responseMimeType: "application/json",
    responseJsonSchema: clean(raw, ["$schema", "additionalProperties", "minimum", "maximum"]),
  });
  await attempt("5. same as 4, also minus maxItems", {
    responseMimeType: "application/json",
    responseJsonSchema: clean(raw, [
      "$schema",
      "additionalProperties",
      "minimum",
      "maximum",
      "maxItems",
    ]),
  });
}

main();