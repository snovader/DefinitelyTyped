import { EventEmitter } from "node:events";
import { createGzip, gzipSync } from "node:zlib";

declare global {
    interface Buffer { decodedLength(): number }
    namespace NodeJS {
        interface EventEmitter { testEventSource(): 42 }
        interface WritableStream { testWritable?(): 17 }
    }
}
export const bytes = gzipSync("test");
export const size = bytes.decodedLength();
export const source: 42 = new EventEmitter().testEventSource();
export const streamSource: 42 = createGzip().testEventSource();
export function pipeTo(destination: NodeJS.WritableStream) {
    return createGzip().pipe(destination).testWritable?.();
}
