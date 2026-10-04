import { SQL_HARNESS } from "./sql-harness";

const PISTON_URL = process.env.PISTON_URL ?? "http://localhost:2000";
const MAX_OUTPUT_CHARS = 10_000;
const SQL_MEMORY_LIMIT_BYTES = 256_000_000;

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

async function execute(body: Record<string, unknown>, timeLimitMs: number): Promise<PistonResponse> {
  const res = await fetch(`${PISTON_URL}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, run_timeout: timeLimitMs }),
    signal: AbortSignal.timeout(timeLimitMs + 20_000),
  });

  const data = (await res.json().catch(() => ({}))) as PistonResponse;
  if (!res.ok) {
    throw new Error(`Piston error ${res.status}: ${data.message ?? "unknown error"}`);
  }
  return data;
}

function toResult(data: PistonResponse, detectCompileError: boolean): RunResult {
  const run = data.run ?? {};
  const compile = data.compile;
  const stderr = `${compile?.stderr ?? ""}${run.stderr ?? ""}`;

  // Java runs from source here, so compile errors usually arrive in the run stage.
  const compileError =
    detectCompileError &&
    ((compile?.code != null && compile.code !== 0) || stderr.includes("error: compilation failed"));

  return {
    stdout: (run.stdout ?? "").slice(0, MAX_OUTPUT_CHARS),
    stderr: stderr.slice(0, MAX_OUTPUT_CHARS),
    exitCode: run.code ?? null,
    signal: run.signal ?? null,
    compileError,
    killed: run.signal != null,
  };
}

export async function runJava(code: string, stdin: string, timeLimitMs: number): Promise<RunResult> {
  const data = await execute(
    {
      language: "java",
      version: "*",
      files: [{ name: "Main.java", content: code }],
      stdin,
    },
    timeLimitMs
  );
  return toResult(data, true);
}

/** Runs a candidate's SQL query against the setup data, inside the locked-down Python harness. */
export async function runSql(setupSql: string, querySql: string, timeLimitMs: number): Promise<RunResult> {
  const data = await execute(
    {
      language: "python",
      version: "*",
      files: [
        { name: "main.py", content: SQL_HARNESS },
        { name: "setup.sql", content: setupSql },
        { name: "query.sql", content: querySql },
      ],
      run_memory_limit: SQL_MEMORY_LIMIT_BYTES,
    },
    timeLimitMs
  );
  return toResult(data, false);
}