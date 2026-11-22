import { callback } from "./fs-emitted.js";
import { environment, runtime } from "./process-emitted.js";
declare global {
    namespace NodeJS {
        interface ErrnoException { marker: 17 }
        interface ProcessEnv { CHECKPOINT: "present" }
    }
}
export const value: "present" = environment.CHECKPOINT;
export const typed = runtime.getBuiltinModule("node:http").createServer;
export const cb = callback(err => { const marker: 17 | undefined = err?.marker; return marker; });
