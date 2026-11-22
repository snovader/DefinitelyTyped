import type { CpuUsage, ProcessEnv, Signals } from "node/select/process-scope.js";

export const cpu: CpuUsage = { user: 1, system: 2 };
export const env: ProcessEnv = { NODE_ENV: "test" };
export const signal: Signals = "SIGTERM";
// @ts-expect-error Signal names remain a literal union without a process selector.
export const invalid: Signals = "not a signal";
