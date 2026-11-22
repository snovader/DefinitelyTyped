import proc, { env } from "node:process";
import bare = require("process");
import { readFile } from "node:fs";

declare global {
    namespace NodeJS {
        interface ProcessEnv { CHECKPOINT: "present" }
        interface Process { checkpoint(): 42; cwd(): "/fixture" }
        interface ErrnoException { checkpoint?: 17 }
    }
    interface Buffer { checkpoint(): 42 }
}

export const environment = env;
export const imported: "present" = env.CHECKPOINT;
export const globalEnv: typeof imported = process.env.CHECKPOINT;
export const value: 42 = bare.checkpoint();
export const path = proc.cwd();
export const globalPath = process.cwd();
export const memory = proc.memoryUsage();
export const read = (path: string) => readFile(path, (err, data) => {
    const marker: 17 | undefined = err?.checkpoint;
    const value: 42 = data.checkpoint();
    return [marker, value];
});
