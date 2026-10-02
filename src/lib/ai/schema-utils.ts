import { z } from "zod";

// Gemini's structured output rejects some JSON Schema keywords that Zod emits.
// Zod still enforces these limits when we validate the response afterwards.
const UNSUPPORTED_KEYS = [
  "$schema",
  "additionalProperties",
  "minimum",
  "maximum",
  "maxItems",
  "minItems",
];

function clean(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(clean);
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (UNSUPPORTED_KEYS.includes(key)) continue;
      out[key] = clean(value);
    }
    return out;
  }
  return node;
}

export function toGeminiSchema(schema: z.ZodType): unknown {
  return clean(z.toJSONSchema(schema));
}