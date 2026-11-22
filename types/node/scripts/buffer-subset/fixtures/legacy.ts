import { atob as decode, Blob, Buffer as NodeBuffer } from "node:buffer";
import { Buffer as BareBuffer } from "buffer";
import proc from "node:process";
import { gzipSync } from "node:zlib";

declare global {
    interface Buffer { legacyInstance(): 42 }
    interface BufferConstructor { legacyStatic(): 17 }
    namespace NodeJS {
        interface ProcessEnv { PROTOTYPE_SAMPLE: "present" }
    }
    function atob(value: 123): "overload";
}

const value: 42 = NodeBuffer.from("text").legacyInstance();
const method: 17 = BareBuffer.legacyStatic();
const globalValue: 42 = Buffer.alloc(4).legacyInstance();
const overloaded: "overload" = decode(123);
const env: "present" = proc.env.PROTOTYPE_SAMPLE;
const encoding: NodeJS.BufferEncoding = "utf8";
const ctor: typeof NodeBuffer = globalThis.Buffer;
globalThis.Buffer = ctor;
export const compressed = gzipSync("hello");
export const buffer = BareBuffer.from("hello");
export const streams = new Blob([buffer]).stream();
export const filesystem = process.getBuiltinModule("node:fs");
export { encoding, env, globalValue, method, overloaded, value };
