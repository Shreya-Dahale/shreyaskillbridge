const PISTON_URL = process.env.PISTON_URL ?? "http://localhost:2000";
const MAX_OUTPUT_CHARS = 10_000;

export type RunResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: string | null;
  compileError: boolean;
  killed: boolean; // stopped by the sandbox (time or memory limit)
};

type PistonStage = {
  stdout?: string;
  stderr?: string;
  code?: number | null;
  signal?: string | null;
};

type PistonResponse = {
  compile?: PistonStage;
  run?: PistonStage;
  message?: string;
};

export async function runJava(code: string, stdin: string, timeLimitMs: number): Promise<RunResult> {
  const res = await fetch(`${PISTON_URL}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: "java",
      version: "*",
      files: [{ name: "Main.java", content: code }],
      stdin,
      run_timeout: timeLimitMs,
    }),
    signal: AbortSignal.timeout(timeLimitMs + 20_000),
  });

  const data = (await res.json().catch(() => ({}))) as PistonResponse;
  if (!res.ok) {
    throw new Error(`Piston error ${res.status}: ${data.message ?? "unknown error"}`);
  }

  const run = data.run ?? {};
  const compile = data.compile;
  const stderr = `${compile?.stderr ?? ""}${run.stderr ?? ""}`;

  // Java runs from source here, so compile errors usually arrive in the run stage.
  const compileError =
    (compile?.code != null && compile.code !== 0) || stderr.includes("error: compilation failed");

  return {
    stdout: (run.stdout ?? "").slice(0, MAX_OUTPUT_CHARS),
    stderr: stderr.slice(0, MAX_OUTPUT_CHARS),
    exitCode: run.code ?? null,
    signal: run.signal ?? null,
    compileError,
    killed: run.signal != null,
  };
}