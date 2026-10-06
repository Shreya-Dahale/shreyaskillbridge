/** True only when the environment variable is exactly "true". Used for the hosted demo. */
export function isDemoMode(value: string | undefined = process.env.DEMO_MODE): boolean {
  return value === "true";
}

export const DEMO_MODE = isDemoMode();

export const DEMO_NOTE =
  "Not available in the hosted demo. It needs a code runner, file storage or an AI key, so it runs in the full local version.";