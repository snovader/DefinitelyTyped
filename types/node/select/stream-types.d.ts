import type { Buffer } from "./buffer-core.js";
import type { BufferEncoding } from "./scoped-buffer.js";
import type { EventEmitter } from "./emitter.js";

// These interfaces are vestigial, and correspond roughly to the "streams2" interfaces
// from early versions of Node.js, but they are still used widely across the ecosystem.
// Accordingly, they are commonly used as "in-types" for @types/node APIs, so that
// eg. streams returned from older libraries will still be considered valid input to
// functions which accept stream arguments.
// It's not possible to change or remove these without astronomical levels of breakage.
export interface ReadableStream extends EventEmitter {
    readable: boolean;
    read(size?: number): string | Buffer;
    setEncoding(encoding: BufferEncoding): this;
    pause(): this;
    resume(): this;
    isPaused(): boolean;
    pipe<T extends WritableStream>(destination: T, options?: { end?: boolean | undefined }): T;
    unpipe(destination?: WritableStream): this;
    unshift(chunk: string | Uint8Array, encoding?: BufferEncoding): void;
    wrap(oldStream: ReadableStream): this;
    [Symbol.asyncIterator](): AsyncIterableIterator<string | Buffer>;
}
export interface WritableStream extends EventEmitter {
    writable: boolean;
    write(buffer: Uint8Array | string, cb?: (err?: Error | null) => void): boolean;
    write(str: string, encoding?: BufferEncoding, cb?: (err?: Error | null) => void): boolean;
    end(cb?: () => void): this;
    end(data: string | Uint8Array, cb?: () => void): this;
    end(str: string, encoding?: BufferEncoding, cb?: () => void): this;
}
export interface ReadWriteStream extends ReadableStream, WritableStream {}
