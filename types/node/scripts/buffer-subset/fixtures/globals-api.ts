declare global {
    namespace NodeJS {
        interface ProcessEnv { GLOBALS_PROBE: "present" }
    }
    interface Buffer { probe(): 42 }
}
export const env = process.env.GLOBALS_PROBE;
export const augmented = Buffer.from("hello").probe();
export const open = process.getBuiltinModule("node:fs").openSync;
export const legacyOpen = process.getBuiltinModule("fs").openSync;
export const timer = setTimeout(() => {}, 1);
export const headers = new Headers({ accept: "text/plain" });
export const response = fetch(new URL("https://example.org"), { headers });
export const body = new Response().body;
export const key = crypto.subtle.generateKey;
export const abort = AbortSignal.timeout(1);
export const channel = new MessageChannel();
export const path = __filename;
export const resolve = require.resolve;
export const from = Buffer.from;
